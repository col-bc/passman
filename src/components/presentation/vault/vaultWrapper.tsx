'use client';

import VaultItemForm from '@/components/forms/vault/vaultItem';
import { useVaults } from '@/hooks/use-vaults';
import { VaultWithItems } from '@/types/server';
import { Flex, Spinner } from '@chakra-ui/react';
import { useSearchParams } from 'next/navigation';
import React from 'react';

export default function VaultItemW({
  vaultId,
  itemId,
  encryptedVaults,
  vaultName,
}: {
  vaultId: string;
  itemId: string;
  encryptedVaults: VaultWithItems[];
  vaultName?: string;
}) {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'edit' ? 'edit' : 'read';

  const { mek, handleUnlock, vaults } = useVaults();

  React.useEffect(() => {
    if (mek && encryptedVaults.length > 0 && vaults.length === 0) {
      handleUnlock(encryptedVaults).catch(console.error);
    }
  }, [mek, encryptedVaults, vaults.length, handleUnlock]);

  if (!mek) {
    return <div>Please enter your Master Encryption Key (MEK) to unlock the locker.</div>;
  }

  const vault = vaults.find((l) => l.id === vaultId);
  const vaultItem = vault?.vaultItems.find((i) => i.itemId === itemId);

  if (!vaultItem) {
    return (
      <Flex justify="center" align="center" p={8}>
        <Spinner size="lg" colorPalette="yellow" />
      </Flex>
    );
  }

  return (
    <Flex direction="column" as="section" gap={8}>
      <VaultItemForm defaultMode={mode} vaultItem={vaultItem} vaultId={vaultId} vaultName={vaultName} />
    </Flex>
  );
}
