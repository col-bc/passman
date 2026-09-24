'use client';

import SignOutButton from '@/components/forms/auth/signOut';
import VaultError from '@/components/presentation/vault/vaultError';
import { PasswordInput } from '@/components/ui/password-input';
import { decryptPayload, deriveHexKey, stringToUint8 } from '@/lib/crypto';
import { DecryptedVault, DecryptedVaultItem, ItemContent } from '@/types/client';
import { VaultWithItems } from '@/types/server';
import { Box, Button, Dialog, Field, Flex, Spinner, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { TbLockOpen } from 'react-icons/tb';

interface VaultContext {
  mek: string | null;
  setMek: (mek: string | null) => void;
  currentVault: DecryptedVault | null;
  setCurrentVault: (vault: DecryptedVault | null) => void;
  unlocking: boolean;
  handleUnlock: (vaultData: VaultWithItems[]) => Promise<DecryptedVault[]>;
  vaults: DecryptedVault[];
}

const VaultContext = React.createContext<VaultContext | undefined>(undefined);

export const useVaults = (): VaultContext => {
  const context = React.useContext(VaultContext);
  if (!context) {
    throw new Error('useVaults must be used within a VaultProvider');
  }
  return context;
};

export function VaultProvider({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathName = usePathname();
  const DISABLE_UNLOCK_ON_PATHS = ['/auth/'];

  const [unlocking, setUnlocking] = React.useState<boolean>(false);
  const [mek, setMek] = React.useState<string | null>(null);
  const [error, setError] = React.useState<{ text: string; type: string } | null>(null);
  const [vaults, setVaults] = React.useState<DecryptedVault[]>([]);
  const [currentVault, setCurrentVault] = React.useState<DecryptedVault | null>(null);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [unlockError, setUnlockError] = React.useState<string | null>(null);
  const isLockedRoute = !DISABLE_UNLOCK_ON_PATHS.some((path) => pathName.startsWith(path));
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(!mek && isLockedRoute);

  const handleManualUnlock = async (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    try {
      const normalizedEmail = userEmail.trim().toLowerCase();
      const derivedMek = await deriveHexKey(passwordInput, normalizedEmail);
      setMek(derivedMek);
      if (process.env.NODE_ENV === 'development') {
        sessionStorage.setItem('DEV_MEK_CACHE', derivedMek);
      }
      setPasswordInput('');
    } catch (err) {
      console.warn('Failed to derive MEK:', err);
      setUnlockError('Invalid password or failed to derive key.');
    }
  };

  const handleUnlock = React.useCallback(
    async (vaultData: VaultWithItems[]): Promise<DecryptedVault[]> => {
      if (!mek) {
        throw new Error('MEK is not set. Cannot unlock vault.');
      }
      if (!error) {
        setUnlocking(true);
        try {
          const decryptedVaults: DecryptedVault[] = await Promise.all(
            vaultData.map(async (vault) => {
              const decryptedItems: (DecryptedVaultItem | null)[] = await Promise.all(
                vault.vaultItems.map(async (vaultItem) => {
                  try {
                    const decryptedItem = await decryptPayload(
                      {
                        ciphertext: stringToUint8(vaultItem.item.ciphertext),
                        iv: stringToUint8(vaultItem.item.iv),
                        tag: stringToUint8(vaultItem.item.tag),
                      },
                      mek,
                    );
                    const decryptedVaultItem: DecryptedVaultItem = {
                      id: vaultItem.vaultId + '-' + vaultItem.itemId,
                      vaultId: vaultItem.vaultId,
                      itemId: vaultItem.itemId,
                      item: {
                        ...vaultItem.item,
                        decryptedData: JSON.parse(decryptedItem as string),
                      },
                    } as unknown as DecryptedVaultItem;
                    return decryptedVaultItem;
                  } catch (error) {
                    console.warn('Failed to decrypt vault item:', error);
                    return null;
                  }
                }),
              );
              console.log(`[handleUnlock] Finished decrypting ${decryptedItems.length} items in vault ${vault.id}`);
              const filteredItems = decryptedItems.filter((item) => item !== null) as DecryptedVaultItem[];
              return {
                ...vault,
                vaultItems: filteredItems,
              } as DecryptedVault;
            }),
          );
          setVaults(decryptedVaults);
          return decryptedVaults;
        } catch (error) {
          setError({ type: 'unlock', text: 'Failed to unlock vault.' });
          console.warn('[handleUnlock] Failed to unlock vault with error: ', error);
          return [];
        } finally {
          setUnlocking(false);
        }
      }
      return [];
    },
    [mek, setError, setVaults, setUnlocking, error],
  );

  const handleAddItem = React.useCallback(
    async (vaultId: string, newItem: ItemContent) => {
      //
    },
    [vaults, setVaults],
  );

  const contextValue: VaultContext = React.useMemo(
    () => ({
      vaults,
      mek,
      setMek,
      handleUnlock,
      currentVault,
      setCurrentVault,
      unlocking,
      error,
    }),
    [vaults, unlocking, mek, handleUnlock, currentVault, setCurrentVault, setMek, error],
  );

  React.useEffect(() => {
    const handleEffect = () => {
      setDialogOpen(!mek && isLockedRoute);
    };
    handleEffect();
  }, [mek, isLockedRoute]);

  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const cachedMek = sessionStorage.getItem('DEV_MEK_CACHE');
      if (cachedMek) {
        const handleEffect = () => {
          setMek(cachedMek);
        };
        handleEffect();
      }
    }
  }, []);

  if (error) return <VaultError type={error.type} text={error.text} />;
  else
    return (
      <VaultContext.Provider value={contextValue}>
        {children}

        <Dialog.Root
          open={dialogOpen}
          onOpenChange={(e) => setDialogOpen(e.open)}
          onExitComplete={() => setUnlocking(false)}
          closeOnInteractOutside={false}
          placement="center"
        >
          <Dialog.Backdrop backdropFilter="blur(10px)" />
          <Dialog.Positioner>
            <Dialog.Content maxW="lg" w="full" bg="bg.panel">
              <Dialog.Header>
                <Dialog.Title>Vault Locked</Dialog.Title>
              </Dialog.Header>
              {unlocking ? (
                <Dialog.Body>
                  <Flex direction="column" align="center" justify="center" maxW="sm" w="full">
                    <Box bg="bg.panel" p={6} borderRadius="md" textAlign="center">
                      <Spinner size="xl" color="yellow.solid" mb={4} />
                      <Text fontSize="sm" color="fg.muted">
                        Please wait while we decrypt your information.
                      </Text>
                    </Box>
                  </Flex>
                </Dialog.Body>
              ) : (
                <>
                  <Dialog.Body>
                    <Flex direction="column" maxW="md" gap={4}>
                      <Dialog.Description>
                        Your session is active, but your encryption keys are missing. Please enter your master password
                        to decrypt your vaults.
                      </Dialog.Description>
                      <Field.Root colorPalette="yellow" invalid={!!unlockError}>
                        <Field.Label>Master Password</Field.Label>
                        <PasswordInput
                          type="password"
                          value={passwordInput}
                          onChange={(e) => setPasswordInput(e.target.value)}
                          placeholder="Enter your master password"
                        />
                        {unlockError && <Field.ErrorText>{unlockError}</Field.ErrorText>}
                      </Field.Root>
                    </Flex>
                  </Dialog.Body>
                  <Dialog.Footer>
                    <SignOutButton variant="subtle" />
                    <Button
                      type="button"
                      colorPalette="yellow"
                      ml="auto"
                      loading={unlocking}
                      loadingText="Unlocking..."
                      onClick={handleManualUnlock}
                    >
                      <TbLockOpen />
                      Unlock Vault
                    </Button>
                  </Dialog.Footer>
                </>
              )}
            </Dialog.Content>
          </Dialog.Positioner>
        </Dialog.Root>
      </VaultContext.Provider>
    );
}
