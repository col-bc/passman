// src/app/locker/[lockerId]/item/new/page.tsx
import LockerItemForm from '@/components/forms/locker/lockerItem';
import { handleGetLockerById } from '@/lib/locker/lockerActions';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{
    lockerId: string;
    itemId: string;
  }>;
};

export default async function NewLockerItemPage({ params }: Props) {
  const user = await handleGetCurrentUser();
  if (!user.success || !user.data) {
    unauthorized();
  }

  const resolvedParams = await params;
  const lockerId = resolvedParams.lockerId;

  const locker = await handleGetLockerById(lockerId);
  if (!locker.success || !locker.data) {
    throw new Error('Failed to fetch locker data');
  }

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
              <Breadcrumb.Link href={`/locker/${lockerId}`}>{locker.data.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>New Item</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="xl" p={6}>
        <LockerItemForm lockerItem={undefined} lockerId={lockerId} defaultMode="edit" />
      </Container>
    </>
  );
}
