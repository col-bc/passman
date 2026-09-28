import VaultList from '@/components/presentation/vault/vaultList';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetFavoriteItems, handleGetVaults } from '@/lib/vault/vaultActions';
import { Container } from '@chakra-ui/react';
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
  const favs = await handleGetFavoriteItems();
  if (!favs.success) {
    if (favs.type === 'UNAUTHORIZED') {
      unauthorized();
    }
    if (favs.type === 'SERVER_ERROR') {
      throw new Error('Server error occurred while fetching favorite items.');
    }
    throw new Error('An unknown error occurred while fetching favorite items.');
  }

  return (
    <Container maxW="5xl" px={[4, 6]} py={6}>
      <VaultList v={vaults.data} favs={favs.data} user={user.data} />
    </Container>
  );
}
