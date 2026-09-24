'use client';

import { useVaults } from '@/hooks/use-vaults';
import { handleCreateVault, handleGetVaults, handleUpdateVault } from '@/lib/vault/vaultActions';
import { DecryptedVault } from '@/types/client';
import { Alert, Button, Dialog, DialogOpenChangeDetails, Field, Flex, Input } from '@chakra-ui/react';
import { unauthorized, useRouter } from 'next/navigation';
import React, { startTransition } from 'react';
import { TbDeviceFloppy, TbPlus, TbX } from 'react-icons/tb';
import { toaster } from '../../ui/toaster';
import IconPicker from './iconPicker';

export default function VaultForm({
  vault,
  setOpen,
}: {
  vault?: DecryptedVault | null;
  setOpen: (open: DialogOpenChangeDetails) => void;
}) {
  const router = useRouter();
  const { handleUnlock } = useVaults();

  const [error, setError] = React.useState('');
  const [title, setTitle] = React.useState(vault?.title || '');
  const [icon, setIcon] = React.useState(vault?.icon || 'default');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (vault) {
      // Update vault
      const updatedVault = await handleUpdateVault(vault.id, { newTitle: title, newIcon: icon });
      if (!updatedVault.success) {
        if (updatedVault.type === 'UNAUTHORIZED') {
          unauthorized();
        }
        setError(updatedVault.error || 'An unknown error occurred.');
      } else {
        setTitle('');
        setIcon('default');

        const freshVaults = await handleGetVaults();
        if (freshVaults.success && freshVaults.data) {
          await handleUnlock(freshVaults.data);
        }

        toaster.success({
          title: 'Vault updated successfully.',
          description: 'Your vault has been updated.',
          action: { label: 'View Vault', onClick: () => router.push(`/vaults/${updatedVault.data.id}`) },
        });
        setOpen({ open: false });
        startTransition(() => {
          router.refresh();
        });
      }
    } else {
      // Create vault
      const newVault = await handleCreateVault(title, icon);
      if (!newVault.success) {
        if (newVault.type === 'UNAUTHORIZED') {
          unauthorized();
        }
        setError(newVault.error || 'An unknown error occurred.');
      } else {
        setTitle('');
        setIcon('default');

        const freshVaults = await handleGetVaults();
        if (freshVaults.success && freshVaults.data) {
          await handleUnlock(freshVaults.data);
        }

        toaster.success({
          title: 'Vault created successfully.',
          description: 'Your new vault has been created.',
          action: { label: 'View Vault', onClick: () => router.push(`/vaults/${newVault.data.id}`) },
        });

        startTransition(() => {
          router.refresh();
          router.push(`/vaults/${newVault.data.id}`);
        });
      }
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Dialog.Header>
        <Dialog.Title>{vault ? 'Update Vault' : 'Create New Vault'}</Dialog.Title>
      </Dialog.Header>
      <Dialog.Body>
        {error && (
          <Alert.Root mb={4} status="error">
            <Alert.Indicator />
            <Alert.Title>Failed to {vault ? 'update' : 'create'} Vault.</Alert.Title>
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}
        <Flex direction="column" gap={6}>
          <Field.Root colorPalette="yellow" required>
            <Field.Label>
              Vault Title <Field.RequiredIndicator />
            </Field.Label>
            <Input placeholder="Enter vault title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field.Root>

          <Field.Root required colorPalette="yellow">
            <Field.Label>
              Vault Icon <Field.RequiredIndicator />
            </Field.Label>
            <IconPicker selectedIcon={icon} onIconChange={setIcon} />
          </Field.Root>
        </Flex>
      </Dialog.Body>
      <Dialog.Footer>
        <Dialog.ActionTrigger asChild>
          <Button variant="subtle" colorPalette="gray" onClick={() => setOpen({ open: false })}>
            <TbX />
            Cancel
          </Button>
        </Dialog.ActionTrigger>
        <Button type="submit" colorPalette="yellow">
          {vault ? (
            <>
              <TbDeviceFloppy />
              Save Changes
            </>
          ) : (
            <>
              <TbPlus />
              Create Vault
            </>
          )}
        </Button>
      </Dialog.Footer>
    </form>
  );
}
export const VaultFormDialog: React.FC<{
  vault?: DecryptedVault | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ vault, open, setOpen }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Positioner>
        <Dialog.Backdrop />
        <Dialog.Content>
          <VaultForm vault={vault} setOpen={(open) => setOpen(open.open)} />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
