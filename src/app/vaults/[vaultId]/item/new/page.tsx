import VaultItemForm from '@/components/forms/vault/vaultItem';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaults } from '@/lib/vault/vaultActions';
import { Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{
    vaultId: string;
    itemId: string;
  }>;
};

export default async function NewVaultItemPage({ params }: Props) {
  const user = await handleGetCurrentUser();
  if (!user.success || !user.data) {
    unauthorized();
  }
  const vaultsStatus = await handleGetVaults();

  const resolvedParams = await params;
  const vaultId = resolvedParams.vaultId;

  const currentVault = vaultsStatus.success ? vaultsStatus.data?.find((vault) => vault.id === vaultId) : null;
  const vaults = vaultsStatus.success ? vaultsStatus.data : [];

  return (
    <Container maxW="xl" px={[4, 6]} py={6}>
      <VaultItemForm vaultItem={undefined} vaultId={vaultId} vaultList={vaults} defaultMode="edit" />
    </Container>
  );
}
