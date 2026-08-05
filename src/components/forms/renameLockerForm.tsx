'use client';

import { handleRenameLocker } from '@/actions/lockerActions';
import { Button, Field, Flex, Input } from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import React from 'react';
import { toaster } from '../ui/toaster';

export default function RenameLockerForm({
  defaultTitle,
  lockerId,
  onClose,
}: {
  defaultTitle: string;
  lockerId: string;
  onClose: () => void;
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
    onClose();
  }

  return (
    <form onSubmit={handleSubmit}>
      <Field.Root colorPalette="yellow" required>
        <Field.Label htmlFor="locker-title">Locker Title</Field.Label>
        <Input id="locker-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field.Root>
      <Flex justifyContent="flex-end" mt={4} gap={2}>
        <Button type="submit" colorPalette="yellow">
          Save Changes
        </Button>
        <Button variant="subtle" colorPalette="gray" onClick={onClose}>
          Cancel
        </Button>
      </Flex>
    </form>
  );
}
