import LockerList from '@/components/presentation/locker/lockerList';
import { handleGetLockers } from '@/lib/locker/lockerActions';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

export default async function LockerPage() {
  const user = await handleGetCurrentUser();
  if (!user.success || !user.data) {
    unauthorized();
  }
  const lockers = await handleGetLockers();
  if (!lockers.success) {
    if (lockers.type === 'UNAUTHORIZED') {
      unauthorized();
    }
    if (lockers.type === 'SERVER_ERROR') {
      throw new Error('Server error occurred while fetching lockers.');
    }
    throw new Error('An unknown error occurred while fetching lockers.');
  }

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border" bg="bg.subtle" shadow="xs">
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Lockers</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" p={6}>
        <LockerList encryptedLockers={lockers.data} user={user.data} />
      </Container>
    </>
  );
}
