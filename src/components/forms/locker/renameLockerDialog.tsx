'use client';

import { handleRenameLocker } from '@/actions/lockerActions';
import { toaster } from '@/components/ui/toaster';
import { Button, Dialog, Field, Heading, Input } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { TbDeviceFloppy, TbX } from 'react-icons/tb';

export default function RenameLockerForm({
  defaultTitle,
  lockerId,
  open,
  setOpen,
}: {
  defaultTitle: string;
  lockerId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
}) {
  const router = useRouter();
  const [title, setTitle] = React.useState(defaultTitle || '');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    const result = await handleRenameLocker(lockerId, title);
    if (!result.success) {
      toaster.error({
        title: 'Failed to rename locker',
        description: result.error || 'An unknown error occurred',
      });
      return;
    }
    toaster.success({
      title: 'Locker renamed',
      description: `Locker renamed to "${title}"`,
    });
    setTitle(result.data.title);
    router.refresh();
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Backdrop />
      <form onSubmit={handleSubmit}>
        <Dialog.Positioner>
          <Dialog.Content>
            <Dialog.Header>
              <Dialog.Title as={Heading} fontSize="lg">
                Rename Locker
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body>
              <Dialog.Description mb={4}>Enter a new name for your locker.</Dialog.Description>
              <Field.Root required colorPalette="yellow">
                <Field.Label>New Locker Name</Field.Label>
                <Input type="text" value={title} onChange={(e) => setTitle(e.target.value)} />
              </Field.Root>
            </Dialog.Body>
            <Dialog.Footer>
              <Dialog.ActionTrigger asChild>
                <Button variant="subtle" colorPalette="gray" onClick={() => setOpen(false)}>
                  <TbX />
                  Cancel
                </Button>
              </Dialog.ActionTrigger>
              <Dialog.ActionTrigger asChild>
                <Button type="submit" colorPalette="yellow">
                  <TbDeviceFloppy />
                  Save Changes
                </Button>
              </Dialog.ActionTrigger>
            </Dialog.Footer>
          </Dialog.Content>
        </Dialog.Positioner>
      </form>
    </Dialog.Root>
  );
}
