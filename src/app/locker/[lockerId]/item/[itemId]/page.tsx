import { handleGetLockerById, handleGetLockerItem } from '@/actions/lockerActions';
import { handleGetCurrentUser } from '@/actions/userActions';
import LockerError from '@/components/presentation/locker/lockerError';
import LockerItemWrapper from '@/components/presentation/locker/lockerWrapper';
import { EncryptedLocker } from '@/types/server';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{
    lockerId: string;
    itemId: string;
  }>;
};

export default async function LockerItemDetailPage({ params }: Props) {
  const user = await handleGetCurrentUser();
  if (!user) {
    unauthorized();
  }

  const resolvedParams = await params;
  const lockerId = resolvedParams.lockerId;
  const itemId = resolvedParams.itemId;

  const encryptedLocker = await handleGetLockerById(lockerId);
  if (!encryptedLocker.success || !encryptedLocker.data) {
    if (!encryptedLocker.success) {
      return <LockerError text={encryptedLocker.error || 'Failed to fetch locker data'} type={encryptedLocker.type} />;
    }
  }
  if (encryptedLocker.data.id) {
  }
  const encryptedItem = await handleGetLockerItem(lockerId, itemId);
  if (!encryptedItem.success || !encryptedItem.data) {
    if (!encryptedItem.success) {
      return <LockerError text={encryptedItem.error || 'Failed to fetch locker item data'} type={encryptedItem.type} />;
    }
  }

  const item = encryptedItem.data;

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border" bg="bg.subtle" shadow="xs">
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/locker`}>Lockers</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/locker/${encryptedLocker.data.id}`}>
                {encryptedLocker.data.title}
              </Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>{item.title}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="xl" p={6}>
        <LockerItemWrapper
          lockerId={lockerId}
          itemId={itemId}
          encryptedLockers={[encryptedLocker.data] as EncryptedLocker[]}
          lockerName={encryptedLocker.data.title}
        />
      </Container>
    </>
  );
}
