import VaultItemList from '@/components/presentation/vault/vaultItemList';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaults } from '@/lib/vault/vaultActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{ vaultId: string }>;
};

export default async function VaultPage({ params }: Props) {
  const user = await handleGetCurrentUser();
  if (!user.success || !user.data) {
    unauthorized();
  }

  const resolvedParams = await params;
  const vaultId = resolvedParams.vaultId;

  const vaultsResponse = await handleGetVaults();
  if (!vaultsResponse.success || !vaultsResponse.data) {
    throw new Error('Failed to fetch vault data');
  }

  const vaultTitle = vaultsResponse.data.find((vault) => vault.id === vaultId)?.title;
  if (!vaultTitle) {
    throw new Error('Vault not found');
  }

  return (
    <>
      <Breadcrumb.Root>
        <Container maxW="5xl" px={[4, 6]} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/vaults`}>Vaults</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>{vaultTitle}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" px={[4, 6]} py={6}>
        <VaultItemList vaultId={vaultId} encryptedVaults={vaultsResponse.data} />
      </Container>
    </>
  );
}
