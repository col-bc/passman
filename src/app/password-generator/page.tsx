import { handleGetCurrentUser } from '@/actions/userActions';
import AppWrapper from '@/components/appWrapper';
import LockerError from '@/components/presentation/locker/lockerError';
import PasswordGenerator from '@/components/util/passwordGenerator';
import { LockerProvider } from '@/hooks/use-locker';
import { Breadcrumb, Container, Heading } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

export default async function PasswordGeneratorPage() {
  const userResult = await handleGetCurrentUser();
  if (!userResult.success) {
    if (userResult.type === 'UNAUTHORIZED') {
      unauthorized();
    } else {
      return (
        <LockerError
          type={userResult.type || 'SERVER_ERROR'}
          text={userResult.error || 'An error occurred while fetching user data.'}
        />
      );
    }
  }

  const user = userResult.data;

  return (
    <LockerProvider userEmail={user!.email}>
      <AppWrapper user={user!}>
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
            <Heading
              as="h1"
              fontSize="3xl"
              mb={8}
              fontWeight="extrabold"
              letterSpacing="tight"
              whiteSpace="nowrap"
              flex={1}
            >
              Password Generator
            </Heading>
            <PasswordGenerator />
          </Container>
        </>
      </AppWrapper>
    </LockerProvider>
  );
}
