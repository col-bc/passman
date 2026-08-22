'use client';

import LockerItemForm from '@/components/forms/locker/lockerItem';
import { useLocker } from '@/hooks/use-locker';
import { EncryptedLocker } from '@/types/server';
import { Flex, Spinner } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function LockerItemWrapper({
  lockerId,
  itemId,
  encryptedLockers,
  lockerName,
}: {
  lockerId: string;
  itemId: string;
  encryptedLockers: EncryptedLocker[];
  lockerName?: string;
}) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'read';

  const { mek, handleUnlock, lockers } = useLocker();

  React.useEffect(() => {
    if (mek && encryptedLockers.length > 0 && lockers.length === 0) {
      handleUnlock(encryptedLockers).catch(console.error);
    }
  }, [mek, encryptedLockers, lockers.length, handleUnlock]);

  if (!mek) {
    return <div>Please enter your Master Encryption Key (MEK) to unlock the locker.</div>;
  }

  const locker = lockers.find((l) => l.id === lockerId);
  const lockerItem = locker?.lockerItems.find((i) => i.itemId === itemId);

  if (!lockerItem) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="lg" colorPalette="yellow" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" as="section" gap={8}>
      <LockerItemForm defaultMode={mode} lockerItem={lockerItem} lockerId={lockerId} lockerName={lockerName} />
    </Flex>
  );
}
