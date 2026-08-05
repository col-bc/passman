'use client';

import SignOutButton from '@/components/forms/signOut'; // Adjust import path as needed
import { PasswordInput } from '@/components/ui/password-input';
import { decryptPayload, deriveHexKey } from '@/lib/crypto';
import { DecryptedLocker, DecryptedLockerItem } from '@/types/client';
import { EncryptedLocker } from '@/types/server';
import { Button, Dialog, Field, Flex, Spinner, Text } from '@chakra-ui/react';
import { usePathname } from 'next/navigation';
import React from 'react';

interface LockerContext {
  mek: string | null;
  setMek: (mek: string | null) => void;
  currentLocker: DecryptedLocker | null;
  setCurrentLocker: (locker: DecryptedLocker | null) => void;
  isLocked: boolean;
  loading: boolean;
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

  const mekFormRef = React.useRef<HTMLFormElement>(null);

  const DISABLE_UNLOCK_ON_PATHS = ['/auth/'];

  const [mek, setMek] = React.useState<string | null>(() => {
    // STRICT DEV GUARD: Never allow this in production
    if (process.env.NODE_ENV === 'development') {
      if (typeof window !== 'undefined') {
        return sessionStorage.getItem('DEV_MEK_CACHE');
      }
    }
    return null;
  });
  const [lockers, setLockers] = React.useState<DecryptedLocker[]>([]);
  const [currentLocker, setCurrentLocker] = React.useState<DecryptedLocker | null>(null);
  const [isLocked, setIsLocked] = React.useState<boolean>(true);
  const [loading, setLoading] = React.useState<boolean>(true);
  const [passwordInput, setPasswordInput] = React.useState('');
  const [unlockError, setUnlockError] = React.useState<string | null>(null);

  const handleManualUnlock = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setUnlockError(null);
    setLoading(true);
    try {
      const derivedMek = await deriveHexKey(passwordInput, userEmail);
      setMek(derivedMek);
      // STRICT DEV GUARD: Save to session storage for hot reloads
      if (process.env.NODE_ENV === 'development') {
        sessionStorage.setItem('DEV_MEK_CACHE', derivedMek);
      }
      setPasswordInput('');
    } catch (err) {
      console.warn('Failed to derive MEK:', err);
      setUnlockError('Invalid password or failed to derive key.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlock = React.useCallback(
    async (lockerData: EncryptedLocker[]): Promise<DecryptedLocker[]> => {
      if (!mek) {
        throw new Error('MEK is not set. Cannot unlock locker.');
      }
      setLoading(true);

      try {
        const decryptedLockers: DecryptedLocker[] = await Promise.all(
          lockerData.map(async (locker) => {
            const decryptedItems: DecryptedLockerItem[] = await Promise.all(
              locker.lockerItems.map(async (lockerItem) => {
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
              }),
            );
            return {
              ...locker,
              lockerItems: decryptedItems,
            };
          }),
        );
        setLockers(decryptedLockers);
        setIsLocked(false);
        return decryptedLockers;
      } catch (error) {
        console.error('Failed to unlock locker:', error);
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [mek],
  );

  const contextValue: LockerContext = {
    lockers,
    isLocked,
    loading,
    mek,
    setMek,
    handleUnlock,
    currentLocker,
    setCurrentLocker,
  };

  return (
    <LockerContext.Provider value={contextValue}>
      {children}

      {!mek && !DISABLE_UNLOCK_ON_PATHS.some((path) => pathName.startsWith(path)) && (
        <Dialog.Root open={true} onOpenChange={() => {}} placement={{ _placeholder: 'center' }}>
          <Dialog.Backdrop backdropFilter="blur(8px)" />
          <Dialog.Positioner>
            {loading ? (
              <Flex direction="column" align="center" justify="center" gap={4} p={6}>
                <Spinner size="xl" color="yellow" />
                <Text>Unlocking items retrieved from the server...</Text>
              </Flex>
            ) : (
              <Dialog.Content>
                <Dialog.Header>
                  <Dialog.Title>Vault Locked</Dialog.Title>
                </Dialog.Header>
                <Dialog.Body>
                  <Flex direction="column" maxW="md" gap={4}>
                    <Dialog.Description>
                      Your session is active, but your encryption keys are missing. Please enter your master password to
                      decrypt your lockers.
                    </Dialog.Description>
                    <form ref={mekFormRef} onSubmit={handleManualUnlock}>
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
                    </form>
                  </Flex>
                </Dialog.Body>
                <Dialog.Footer>
                  <SignOutButton variant="subtle" />
                  <Button
                    type="submit"
                    colorPalette="yellow"
                    ml="auto"
                    loading={loading}
                    loadingText="Unlocking..."
                    onClick={() => mekFormRef.current?.requestSubmit()}
                  >
                    Unlock Vault
                  </Button>
                </Dialog.Footer>
              </Dialog.Content>
            )}
          </Dialog.Positioner>
        </Dialog.Root>
      )}
    </LockerContext.Provider>
  );
}
