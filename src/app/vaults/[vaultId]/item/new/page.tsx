import VaultItemForm from '@/components/forms/vault/vaultItem';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { handleGetVaultById } from '@/lib/vault/vaultActions';
import { Breadcrumb, Container } from '@chakra-ui/react';
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

  const resolvedParams = await params;
  const vaultId = resolvedParams.vaultId;

  const vault = await handleGetVaultById(vaultId);
  if (!vault.success || !vault.data) {
    throw new Error('Failed to fetch vault data');
  }

  return (
    <>
      <Breadcrumb.Root variant="underline" borderBottom="1px solid" borderColor="border" bg="bg.subtle" shadow="xs">
        <Container maxW="5xl" px={[4, 6]} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/vaults`}>Vaults</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/vaults/${vaultId}`}>{vault.data.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>New Item</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="xl" px={[4, 6]} py={6}>
        <VaultItemForm vaultItem={undefined} vaultId={vaultId} defaultMode="edit" />
      </Container>
    </>
  );
}
