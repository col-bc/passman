// src/app/locker/[lockerId]/item/new/page.tsx
import { handleGetLockerById } from '@/actions/lockerActions';
import LockerItemForm from '@/components/forms/lockerItem';
import { getCurrentUser } from '@/lib/session';
import { EncryptedLocker } from '@/types/server'; // Make sure to import this
import { Box, Breadcrumb, Container, Flex, Heading } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{
    lockerId: string;
    itemId: string;
  }>;
};

export default async function NewLockerItemPage({ params }: Props) {
  const user = await getCurrentUser();
  if (!user) {
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
      <Breadcrumb.Root mb={6} variant="underline" borderBottom="1px solid" borderColor="border">
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
      <Container maxW="5xl" p={6}>
        <Flex direction="column" as="section" gap={8}>
          <Box w="full" maxW="xl" mx="auto">
            <Heading as="h1" size="3xl" mb={8} fontFamily="heading" fontWeight="bolder" letterSpacing="tighter">
              Create a New Locker Item
            </Heading>

            <LockerItemForm
              lockerItem={null}
              lockerId={lockerId}
              // 1. Pass the fetched data down to the client
              encryptedLockers={[locker.data] as EncryptedLocker[]}
            />
          </Box>
        </Flex>
      </Container>
    </>
  );
}
