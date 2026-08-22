import { handleGetLockerById } from '@/actions/lockerActions';
import LockerError from '@/components/presentation/locker/lockerError';
import { Box, Breadcrumb, Code, Container, Flex, Heading } from '@chakra-ui/react';
import { TbHash } from 'react-icons/tb';

type Props = {
  params: Promise<{
    lockerId: string;
  }>;
};

export default async function ImportLockerItemsPage({ params }: Props) {
  const { lockerId } = await params;
  const locker = await handleGetLockerById(lockerId);
  if (!locker.success) {
    return <LockerError type={locker.type} text={locker.error} />;
  }

  const encryptedLocker = locker.data;

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
              <Breadcrumb.Link href={`/locker/${encryptedLocker.id}`}>{encryptedLocker.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Import</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" w="full" p={6}>
        <Flex direction="column" as="section" gap={8}>
          <Box>
            <Heading as="h1" mb={2} size="3xl" fontFamily="heading" fontWeight="bolder" letterSpacing="tighter">
              Import Items
            </Heading>
            <Code display="inline-flex" variant="surface" alignItems="center" gap={2} fontFamily="heading">
              <TbHash />
              {encryptedLocker.id}
            </Code>
          </Box>
        </Flex>
      </Container>
    </>
  );
}
