import AppWrapper from '@/components/appWrapper';
import AccountSettings from '@/components/presentation/account/accountSettings';
import VaultError from '@/components/presentation/vault/vaultError';
import { VaultProvider } from '@/hooks/use-vaults';

import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Container, Heading } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

export default async function AccountPage() {
  const user = await handleGetCurrentUser();
  if (!user.success) {
    if (user.type === 'UNAUTHORIZED') {
      unauthorized();
    }
    return (
      <VaultError
        type={user.type}
        text="An error occurred while trying to fulfill your request. Please try again later."
      />
    );
  } else if (user.success && user.data) {
    return (
      <VaultProvider userEmail={user.data.email}>
        <AppWrapper user={user.data}>
          <Container maxW="5xl" px={[4, 6]} py={6}>
            <Heading
              as="h1"
              fontSize="3xl"
              mb={8}
              fontWeight="extrabold"
              letterSpacing="tight"
              whiteSpace="nowrap"
              flex={1}
            >
              Account Settings
            </Heading>

            <AccountSettings user={user.data} />
          </Container>
        </AppWrapper>
      </VaultProvider>
    );
  }
}
