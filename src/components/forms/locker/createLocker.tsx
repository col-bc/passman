'use client';

import { handleCreateLocker } from '@/actions/lockerActions';
import { Alert, Button, Dialog, Field, Flex, Icon, Input } from '@chakra-ui/react';
import { unauthorized } from 'next/navigation';
import React from 'react';
import { TbLockSquareRoundedFilled, TbPlus, TbX } from 'react-icons/tb';
import { toaster } from '../../ui/toaster';
import { IconPickerDialog, lockerIconMap } from './iconPicker';

export default function CreateLockerDialog({ children }: { children: React.ReactNode }) {
  const [error, setError] = React.useState('');
  const [title, setTitle] = React.useState('');

  const [icon, setIcon] = React.useState('default');
  const [showIconPickerDialog, setShowIconPickerDialog] = React.useState(false);

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');

    const status = await handleCreateLocker(title);
    if (!status.success) {
      if (status.type === 'UNAUTHORIZED') {
        unauthorized();
      }
      setError(status.error || 'An unknown error occurred.');
    } else {
      setTitle('');
      toaster.success({ title: 'Locker created successfully.', description: 'Your new locker has been created.' });
    }
  }

  const LockerIcon = lockerIconMap[icon] || TbLockSquareRoundedFilled;

  return (
    <>
      <Dialog.Root>
        <Dialog.Trigger asChild>{children}</Dialog.Trigger>
        <Dialog.Positioner>
          <Dialog.Backdrop />
          <Dialog.Content>
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
          </Dialog.Content>
        </Dialog.Positioner>
      </Dialog.Root>

      <IconPickerDialog
        open={showIconPickerDialog}
        setOpen={(open) => setShowIconPickerDialog(open)}
        selectedIcon={icon}
        onIconChange={(iconName) => setIcon(iconName)}
      />
    </>
  );
}
