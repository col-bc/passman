'use client';

import { handleCreateLocker, handleUpdateLocker } from '@/lib/locker/lockerActions';
import { DecryptedLocker } from '@/types/client';
import { Alert, Button, Dialog, Field, Flex, Icon, Input } from '@chakra-ui/react';
import { unauthorized, useRouter } from 'next/navigation';
import React from 'react';
import { TbLockSquareRoundedFilled, TbPlus, TbX } from 'react-icons/tb';
import { toaster } from '../../ui/toaster';
import { IconPickerDialog, lockerIconMap } from './iconPicker';

export default function LockerForm({ locker }: { locker?: DecryptedLocker | null }) {
  const router = useRouter();

  const [error, setError] = React.useState('');
  const [title, setTitle] = React.useState('');

  const [icon, setIcon] = React.useState('default');
  const [showIconPickerDialog, setShowIconPickerDialog] = React.useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    if (locker) {
      // Update locker
      const updatedLocker = await handleUpdateLocker(locker.id, { newTitle: title, newIcon: icon });
      if (!updatedLocker.success) {
        if (updatedLocker.type === 'UNAUTHORIZED') {
          unauthorized();
        }
        setError(updatedLocker.error || 'An unknown error occurred.');
      } else {
        setTitle('');
        setIcon('default');
        toaster.success({
          title: 'Locker updated successfully.',
          description: 'Your locker has been updated.',
          action: { label: 'View Locker', onClick: () => router.push(`/locker/${updatedLocker.data.id}`) },
        });
      }
    } else {
      // Create locker
      const newLocker = await handleCreateLocker(title);
      if (!newLocker.success) {
        if (newLocker.type === 'UNAUTHORIZED') {
          unauthorized();
        }
        setError(newLocker.error || 'An unknown error occurred.');
      } else {
        setTitle('');
        toaster.success({
          title: 'Locker created successfully.',
          description: 'Your new locker has been created.',
          action: { label: 'View Locker', onClick: () => router.push(`/locker/${newLocker.data.id}`) },
        });
      }
    }
  }

  const LockerIcon = lockerIconMap[icon] || TbLockSquareRoundedFilled;

  return (
    <>
      <form onSubmit={handleSubmit}>
        <Dialog.Header>
          <Dialog.Title>Create Locker</Dialog.Title>
        </Dialog.Header>
        <Dialog.Body>
          {error && (
            <Alert.Root>
              <Alert.Indicator />
              <Alert.Title>Failed to create Locker.</Alert.Title>
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
                <LockerIcon />
              </Icon>
              <Field.HelperText>Click the icon to change it.</Field.HelperText>
            </Field.Root>

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
          <Button type="submit" colorPalette="yellow">
            <TbPlus />
            Create Locker
          </Button>
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

export const LockerFormDialog: React.FC<{
  locker?: DecryptedLocker | null;
  open: boolean;
  setOpen: (open: boolean) => void;
}> = ({ locker, open, setOpen }) => {
  return (
    <Dialog.Root open={open} onOpenChange={(e) => setOpen(e.open)}>
      <Dialog.Positioner>
        <Dialog.Backdrop />
        <Dialog.Content>
          <LockerForm locker={locker} />
        </Dialog.Content>
      </Dialog.Positioner>
    </Dialog.Root>
  );
};
