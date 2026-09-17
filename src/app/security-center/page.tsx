import SecurityCenterDash from '@/components/presentation/securityCenter/securityCenterDash';
import VaultError from '@/components/presentation/vault/vaultError';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaults } from '@/lib/vault/vaultActions';
import { Breadcrumb, Container, Flex, Heading, Text } from '@chakra-ui/react';

export default async function SecurityCenterPage() {
  const result = await handleGetCurrentUser();
  if (!result.success) {
    return <VaultError type={result.type} text="No current user data available." />;
  }
  const vaultsResult = await handleGetVaults();
  if (!vaultsResult.success) {
    return <VaultError type={vaultsResult.type} text="No vault data available." />;
  }

  const user = result.data;
  const vaults = vaultsResult.data;

  return (
    <>
      <Breadcrumb.Root>
        <Container maxW="5xl" px={[4, 6]} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Security Center</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" px={[4, 6]} py={6}>
        <Flex direction="column">
          <Flex direction="column" gap={4} mb={8}>
            <Heading as="h1" fontSize="3xl" fontWeight="extrabold" letterSpacing="tight" whiteSpace="nowrap" flex={1}>
              Security Center
            </Heading>
            <Text color="muted" fontSize="sm" flexShrink={0}>
              Review and manage security exceptions across all your vaults. Resolve issues to enhance your security
              score and protect your data.
            </Text>
          </Flex>

          <SecurityCenterDash user={user!} encryptedVaults={vaults} />
        </Flex>
      </Container>
    </>
  );
}
