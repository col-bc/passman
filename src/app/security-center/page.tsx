import SecurityCenterDash from '@/components/presentation/securityCenter/securityCenterDash';
import VaultError from '@/components/presentation/vault/vaultError';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaults } from '@/lib/vault/vaultActions';
import { Container, Flex } from '@chakra-ui/react';

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
    <Container maxW="5xl" px={[4, 6]} py={6}>
      <Flex direction="column">
        <SecurityCenterDash user={user!} encryptedVaults={vaults} />
      </Flex>
    </Container>
  );
}
