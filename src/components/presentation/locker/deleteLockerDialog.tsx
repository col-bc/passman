'use client';

import { Button, CloseButton, Dialog, DialogOpenChangeDetails, Flex } from '@chakra-ui/react';
import { TbTrash, TbX } from 'react-icons/tb';

export default function DeleteLockerDialog({
  lockerId,
  open,
  onOpenChange,
}: {
  lockerId: string;
  open: boolean;
  onOpenChange: (open: DialogOpenChangeDetails) => void;
}) {
  function handleDelete() {
    // Implement the delete logic here
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
            <Dialog.Title mb={4}>Delete Locker?</Dialog.Title>
            <Dialog.Description>
              Are you sure you want to delete this locker? This deletes the locker and its associated data permanently.
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
                Yes, Delete Locker
              </Button>
            </Dialog.ActionTrigger>
          </Dialog.Footer>
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
}
