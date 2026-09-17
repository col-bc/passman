import VaultError from '@/components/presentation/vault/vaultError';
import VaultItemWrapper from '@/components/presentation/vault/vaultWrapper';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaultItem, handleGetVaults } from '@/lib/vault/vaultActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';

type Props = {
  params: Promise<{
    vaultId: string;
    itemId: string;
  }>;
};

export default async function VaultItemDetailPage({ params }: Props) {
  const user = await handleGetCurrentUser();
  if (!user) {
    unauthorized();
  }

  const resolvedParams = await params;
  const vaultId = resolvedParams.vaultId;
  const itemId = resolvedParams.itemId;

  const encryptedVault = await handleGetVaults();
  if (!encryptedVault.success || !encryptedVault.data) {
    if (!encryptedVault.success) {
      return <VaultError type="ERROR" text={encryptedVault.error || 'Failed to fetch vault data'} />;
    }
  }

  const currentVault = encryptedVault.data.find((v) => v.id === vaultId);

  const encryptedItem = await handleGetVaultItem(vaultId, itemId);
  if (!encryptedItem.success || !encryptedItem.data) {
    if (!encryptedItem.success) {
      return <VaultError type="ERROR" text={encryptedItem.error || 'Failed to fetch vault item data'} />;
    }
  }

  const item = encryptedItem.data;

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
              <Breadcrumb.Link href={`/vaults/${currentVault?.id}`}>{currentVault?.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>{item.title}</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="xl" px={[4, 6]} py={6}>
        <VaultItemWrapper
          vaultId={vaultId}
          itemId={itemId}
          encryptedVaults={encryptedVault.data}
          vaultName={currentVault?.title}
        />
      </Container>
    </>
  );
}
