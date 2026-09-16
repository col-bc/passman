'use client';

import { handleCreateVault, handleUpdateVault } from '@/lib/vault/vaultActions';
import { DecryptedVault } from '@/types/client';
import { Alert, Button, Dialog, Field, Flex, Icon, Input } from '@chakra-ui/react';
import { unauthorized, useRouter } from 'next/navigation';
import React from 'react';
import { TbDeviceFloppy, TbLockSquareRoundedFilled, TbPlus, TbX } from 'react-icons/tb';
import { toaster } from '../../ui/toaster';
import { IconPickerDialog, VaultIconMap } from './iconPicker';

export default function VaultForm({ vault }: { vault?: DecryptedVault | null }) {
  const router = useRouter();

  const [error, setError] = React.useState('');
  const [title, setTitle] = React.useState(vault?.title || '');

  const [icon, setIcon] = React.useState(vault?.icon || 'default');
  const [showIconPickerDialog, setShowIconPickerDialog] = React.useState(false);

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
        setShowIconPickerDialog(false);
        toaster.success({
          title: 'Locker updated successfully.',
          description: 'Your locker has been updated.',
          action: { label: 'View Locker', onClick: () => router.push(`/vaults/${updatedVault.data.id}`) },
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
        toaster.success({
          title: 'Locker created successfully.',
          description: 'Your new locker has been created.',
          action: { label: 'View Locker', onClick: () => router.push(`/vaults/${newVault.data.id}`) },
        });
      }
    }
  }

  const VaultIcon = VaultIconMap[icon] || TbLockSquareRoundedFilled;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Dialog.Header>
          <Dialog.Title>{vault ? 'Update Vault' : 'Create New Vault'}</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {error && (
            <Alert.Root>
              <Alert.Indicator />
              <Alert.Title>Failed to {vault ? 'update' : 'create'} Vault.</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Root>
          )}
          <Flex direction="column" gap={4}>
            <Field.Root required colorPalette="yellow">
              <Field.Label>
                Icon <Field.RequiredIndicator />
              </Field.Label>
              <Icon
                boxSize={24}
                borderRadius="md"
                bg="yellow.subtle"
                p={4}
                onClick={() => setShowIconPickerDialog(true)}
                cursor="pointer"
              >
                <VaultIcon />
              </Icon>
              <Field.HelperText>Click the icon to change it.</Field.HelperText>
            </Field.Root>
            IconName: {icon}
            <Field.Root colorPalette="yellow" required>
              <Field.Label>
                Title <Field.RequiredIndicator />
              </Field.Label>
              <Input placeholder="Enter locker title" value={title} onChange={(e) => setTitle(e.target.value)} />
            </Field.Root>
          </Flex>
        </Dialog.Body>
        <Dialog.Footer>
          <Dialog.ActionTrigger asChild>
            <Button variant="subtle" colorPalette="gray">
              <TbX />
              Cancel
            </Button>
          </Dialog.ActionTrigger>
          <Dialog.ActionTrigger asChild>
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
          </Dialog.ActionTrigger>
        </Dialog.Footer>
      </form>

      <IconPickerDialog
        open={showIconPickerDialog}
        setOpen={(open) => setShowIconPickerDialog(open)}
        selectedIcon={icon}
        onIconChange={(iconName) => setIcon(iconName)}
      />
    </>
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
          <VaultForm vault={vault} />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
