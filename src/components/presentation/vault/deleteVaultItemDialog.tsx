'use client';

import { toaster } from '@/components/ui/toaster';
import { useVaults } from '@/hooks/use-vaults';
import { handleDeleteVaultItem, handleGetVaults } from '@/lib/vault/vaultActions';

import { Button, CloseButton, Dialog, Flex } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { startTransition } from 'react';
import { TbTrash, TbX } from 'react-icons/tb';

export default function DeleteVaultItemDialog({
  open,
  onOpenChange,
  vaultId,
  itemId,
}: {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  vaultId: string;
  itemId: string;
}) {
  const { handleUnlock } = useVaults();
  const router = useRouter();

  async function handleDelete() {
    const result = await handleDeleteVaultItem(vaultId, itemId);
    if (result.success) {
      toaster.success({ title: 'Vault item deleted successfully' });
      onOpenChange({ open: false }); // Close the dialog
      const freshVaults = await handleGetVaults();
      if (freshVaults.success && freshVaults.data) {
        await handleUnlock(freshVaults.data);
      }

      startTransition(() => {
        router.refresh();
        router.push(`/vaults/${vaultId}`);
      });
    }
  }

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Backdrop />
      <Dialog.Positioner>
        <Dialog.Content>
          <Dialog.Header>
            <Flex
              w={16}
              h={16}
              align="center"
              justify="center"
              rounded="lg"
              bg="red.subtle"
              color="red.fg"
              fontSize="5xl"
            >
              <TbTrash />
            </Flex>
          </Dialog.Header>
          <Dialog.Body>
            <Dialog.Title mb={4}>Delete Vault Item?</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this item from the vault? This deletes the item and its associated data
              permanently.
            </Dialog.Description>
          </Dialog.Body>
          <Dialog.Footer>
            <Dialog.CloseTrigger asChild>
              <CloseButton />
            </Dialog.CloseTrigger>
            <Dialog.ActionTrigger asChild>
              <Button variant="subtle" onClick={() => onOpenChange({ open: false })}>
                <TbX />
                Cancel
              </Button>
            </Dialog.ActionTrigger>
            <Dialog.ActionTrigger asChild>
              <Button colorPalette="red" variant="solid" onClick={handleDelete}>
                <TbTrash />
                Yes, Delete Item
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
