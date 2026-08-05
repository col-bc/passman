import { handleGetLockers } from '@/actions/lockerActions';
import LockerList from '@/components/presentation/lockerList';
import { getCurrentUser } from '@/lib/session';
import { Breadcrumb, Button, Container, Flex, Heading } from '@chakra-ui/react';
import Link from 'next/link';
import { unauthorized } from 'next/navigation';
import { TbPlus } from 'react-icons/tb';

export default async function LockerPage() {
  const user = await getCurrentUser();
  if (!user) {
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
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border">
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Lockers</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" p={6}>
        <Flex direction="column">
          <Flex direction="row" align="center" justify="space-between" mb={8}>
            <Heading as="h1" size="3xl" mb={8} fontFamily="heading" fontWeight="bolder">
              Your Lockers
            </Heading>

            <Link href="/locker/new" style={{ textDecoration: 'none' }}>
              <Button colorScheme="blue" size="md" colorPalette="yellow">
                <TbPlus />
                Create New Locker
              </Button>
            </Link>
          </Flex>
        </Flex>

        <LockerList encryptedLockers={lockers.data} user={user} />
      </Container>
    </>
  );
}
