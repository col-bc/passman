'use client';

import { useLocker } from '@/hooks/use-locker';
import { EncryptedLocker } from '@/types/server';
import { Flex, Spinner } from '@chakra-ui/react';
import React from 'react';
import LockerItemForm from '../forms/lockerItem'; // Import the form directly

export default function LockerItemWrapper({
  lockerId,
  itemId,
  encryptedLockers,
}: {
  lockerId: string;
  itemId: string;
  encryptedLockers: EncryptedLocker[];
}) {
  const { mek, handleUnlock, lockers } = useLocker();

  React.useEffect(() => {
    if (mek && encryptedLockers.length > 0 && lockers.length === 0) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers.length, handleUnlock]);

  if (!mek) {
    return <div>Please enter your Master Encryption Key (MEK) to unlock the locker.</div>;
  }

  const targetLocker = lockers.find((l) => l.id === lockerId);
  const targetItem = targetLocker?.lockerItems.find((i) => i.itemId === itemId);

  if (!targetItem) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="lg" colorPalette="yellow" />
      </Flex>
    );
  }

  return <LockerItemForm lockerItem={targetItem} lockerId={lockerId} />;
}
