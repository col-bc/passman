import VaultError from '@/components/presentation/vault/vaultError';
import { handleGetVaultById } from '@/lib/vault/vaultActions';
import { Box, Breadcrumb, Code, Container, Flex, Heading } from '@chakra-ui/react';
import { TbHash } from 'react-icons/tb';

type Props = {
  params: Promise<{
    vaultId: string;
  }>;
};

export default async function ImportVaultItemsPage({ params }: Props) {
  const { vaultId } = await params;
  const vault = await handleGetVaultById(vaultId);
  if (!vault.success) {
    return <VaultError type={vault.type} text={vault.error} />;
  }

  const encryptedVault = vault.data;

  return (
    <>
      <Breadcrumb.Root>
        <Container maxW="5xl" px={6} py={3}>
          <Breadcrumb.List>
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/vaults`}>Vaults</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.Link href={`/vaults/${encryptedVault.id}`}>{encryptedVault.title}</Breadcrumb.Link>
            </Breadcrumb.Item>
            <Breadcrumb.Separator />
            <Breadcrumb.Item>
              <Breadcrumb.CurrentLink>Import</Breadcrumb.CurrentLink>
            </Breadcrumb.Item>
          </Breadcrumb.List>
        </Container>
      </Breadcrumb.Root>
      <Container maxW="5xl" w="full" p={6}>
        <Flex direction="column" as="section" gap={8}>
          <Box>
            <Heading as="h1" mb={2} size="3xl" fontFamily="heading" fontWeight="bolder" letterSpacing="tighter">
              Import Items
            </Heading>
            <Code display="inline-flex" variant="surface" alignItems="center" gap={2} fontFamily="heading">
              <TbHash />
              {encryptedVault.id}
            </Code>
          </Box>
        </Flex>
      </Container>
    </>
  );
}
