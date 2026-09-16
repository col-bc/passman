import VaultList from '@/components/presentation/vault/vaultList';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaults } from '@/lib/vault/vaultActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

export default async function RootVaultPage() {
  const user = await handleGetCurrentUser();
  if (!user.success || !user.data) {
    unauthorized();
  }
  const vaults = await handleGetVaults();
  if (!vaults.success) {
    if (vaults.type === 'UNAUTHORIZED') {
      unauthorized();
    }
    if (vaults.type === 'SERVER_ERROR') {
      throw new Error('Server error occurred while fetching vaults.');
    }
    throw new Error('An unknown error occurred while fetching vaults.');
  }

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border" bg="bg.subtle" shadow="xs">
        <Container maxW="5xl" px={[4, 6]} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Vaults</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" px={[4, 6]} py={6}>
        <VaultList v={vaults.data} user={user.data} />
      </Container>
    </>
  );
}
