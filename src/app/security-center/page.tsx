import { handleGetLockers } from '@/actions/lockerActions';
import { handleGetCurrentUser } from '@/actions/userActions';
import LockerError from '@/components/presentation/locker/lockerError';
import SecurityCenterDash from '@/components/presentation/securityCenter/securityCenterDash';
import { Breadcrumb, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default async function SecurityCenterPage() {
  const result = await handleGetCurrentUser();
  if (!result.success) {
    return <LockerError type={result.type} text="No current user data available." />;
  }
  const lockerResult = await handleGetLockers();
  if (!lockerResult.success) {
    return <LockerError type={lockerResult.type} text="No locker data available." />;
  }

  const user = result.data;
  const lockers = lockerResult.data;

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border" bg="bg.subtle" shadow="xs">
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Security Center</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" p={6}>
        <Flex direction="column">
          <Flex direction="column" gap={4} mb={8}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              Security Center
            </Heading>
            <Text color="muted" fontSize="sm" flexShrink={0}>
              Review and manage security exceptions across all your lockers. Resolve issues to enhance your security
              score and protect your data.
            </Text>
          </Flex>

          <SecurityCenterDash user={user!} encryptedLockers={lockers} />
        </Flex>
      </Container>
    </>
  );
}
