'use client';

import SignOutButton from '@/components/forms/signOut';
import { PasswordInput } from '@/components/ui/password-input';
import { decryptPayload, deriveHexKey } from '@/lib/crypto';
import { DecryptedLocker, DecryptedLockerItem } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import { Box, Button, Dialog, Field, Flex, Spinner, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React from 'react';
import { TbLockOpen } from 'react-icons/tb';

interface LockerContext {
  mek: string | null;
  setMek: (mek: string | null) => void;
  currentLocker: DecryptedLocker | null;
  setCurrentLocker: (locker: DecryptedLocker | null) => void;
  unlocking: boolean;
  handleUnlock: (lockerData: EncryptedLocker[]) => Promise<DecryptedLocker[]>;
  lockers: DecryptedLocker[];
}

const LockerContext = React.createContext<LockerContext | undefined>(undefined);

export const useLocker = (): LockerContext => {
  const context = React.useContext(LockerContext);
  if (!context) {
    throw new Error('useLocker must be used within a LockerProvider');
  }
  return context;
};

export function LockerProvider({ children, userEmail }: { children: React.ReactNode; userEmail: string }) {
  const pathName = usePathname();
  const DISABLE_UNLOCK_ON_PATHS = ['/auth/'];

  const [unlocking, setUnlocking] = React.useState<boolean>(false);
  const [mek, setMek] = React.useState<string | null>(null);
  const [lockers, setLockers] = React.useState<DecryptedLocker[]>([]);
  const [currentLocker, setCurrentLocker] = React.useState<DecryptedLocker | null>(null);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [unlockError, setUnlockError] = React.useState<string | null>(null);
  const isLockedRoute = !DISABLE_UNLOCK_ON_PATHS.some((path) => pathName.startsWith(path));
  const [dialogOpen, setDialogOpen] = React.useState<boolean>(!mek && isLockedRoute);

  const handleManualUnlock = async (e: React.SyntheticEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setUnlockError(null);
    try {
      const derivedMek = await deriveHexKey(passwordInput, userEmail);
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
    async (lockerData: EncryptedLocker[]): Promise<DecryptedLocker[]> => {
      if (!mek) {
        throw new Error('MEK is not set. Cannot unlock locker.');
      }
      setUnlocking(true);
      try {
        const decryptedLockers: DecryptedLocker[] = await Promise.all(
          lockerData.map(async (locker) => {
            const decryptedItems: (DecryptedLockerItem | null)[] = await Promise.all(
              locker.lockerItems.map(async (lockerItem) => {
                try {
                  const decryptedItem = await decryptPayload(
                    {
                      ciphertext: lockerItem.item.ciphertext,
                      iv: lockerItem.item.iv,
                      tag: lockerItem.item.tag,
                    },
                    mek,
                  );
                  return {
                    id: lockerItem.lockerId + '-' + lockerItem.itemId,
                    lockerId: lockerItem.lockerId,
                    itemId: lockerItem.itemId,
                    item: {
                      ...lockerItem.item,
                      decryptedData: JSON.parse(decryptedItem as string),
                    },
                  } as DecryptedLockerItem;
                } catch (error) {
                  console.warn('Failed to decrypt locker item:', error);
                  return null;
                }
              }),
            );
            return {
              ...locker,
              lockerItems: decryptedItems.filter((item) => item !== null) as DecryptedLockerItem[],
            };
          }),
        );
        setLockers(decryptedLockers);
        return decryptedLockers;
      } catch (error) {
        console.error('Failed to unlock locker:', error);
        throw error;
      } finally {
        setUnlocking(false);
      }
    },
    [mek, setUnlocking, setLockers],
  );

  const contextValue: LockerContext = React.useMemo(
    () => ({
      lockers,
      mek,
      setMek,
      handleUnlock,
      currentLocker,
      setCurrentLocker,
      unlocking,
    }),
    [lockers, unlocking, mek, handleUnlock, currentLocker, setCurrentLocker, setMek],
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

  return (
    <LockerContext.Provider value={contextValue}>
      {children}

      <Dialog.Root
        open={dialogOpen}
        onOpenChange={(e) => setDialogOpen(e.open)}
        onExitComplete={() => setUnlocking(false)}
        placement="center"
      >
        <Dialog.Backdrop backdropFilter="blur(8px)" />
        <Dialog.Positioner>
          <Dialog.Content>
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
                      Your session is active, but your encryption keys are missing. Please enter your master password to
                      decrypt your lockers.
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
    </LockerContext.Provider>
  );
}
