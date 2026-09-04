'use client';

import { toaster } from '@/components/ui/toaster';
import { handleDeleteLockerItem } from '@/lib/locker/lockerActions';
import { Button, CloseButton, Dialog, Flex } from '@chakra-ui/react';
import { redirect } from 'next/navigation';
import { TbTrash, TbX } from 'react-icons/tb';

export default function DeleteLockerItemDialog({
  open,
  onOpenChange,
  lockerId,
  itemId,
}: {
  open: boolean;
  onOpenChange: (details: { open: boolean }) => void;
  lockerId: string;
  itemId: string;
}) {
  async function handleDelete() {
    const result = await handleDeleteLockerItem(lockerId, itemId);
    if (result.success) {
      toaster.success({ title: 'Locker item deleted successfully' });
      onOpenChange({ open: false }); // Close the dialog
      redirect(`/locker/${lockerId}`);
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
            <Dialog.Title mb={4}>Delete Locker Item?</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this item from the locker? This deletes the item and its associated data
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
