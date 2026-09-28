import AppWrapper from '@/components/appWrapper';
import VaultError from '@/components/presentation/vault/vaultError';
import { VaultProvider } from '@/hooks/use-vaults';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { Container, Flex, Heading } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

export default async function SharingPage({ children }: { children: React.ReactNode }) {
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
  }
  const userData = user.success ? user.data : null;
  return (
    <VaultProvider userEmail={userData!.email}>
      <AppWrapper user={userData!}>
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
            Sharing Center
          </Heading>

          <Flex w="full" flex={1} direction="column">
            {children}
          </Flex>
        </Container>
      </AppWrapper>
    </VaultProvider>
  );
}
