'use client';

import { PasswordInput } from '@/components/ui/password-input';
import { Button, Card, Field } from '@chakra-ui/react';
import { TbDeviceFloppy } from 'react-icons/tb';

export default function ChangePasswordForm() {
  const handleSubmit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    // Add your form submission logic here
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card.Body spaceY={4}>
        <Card.Description>
          Your master password is used to encrypt and decrypt your data and to log you into your account. Changing it
          will re-encrypt all your data with the new master password.
        </Card.Description>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Current Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput type="password" placeholder="Enter your current password" required />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            New Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput type="password" placeholder="Enter your new password" required />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Confirm New Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput type="password" placeholder="Confirm your new password" required />
        </Field.Root>
      </Card.Body>
      <Card.Footer>
        <Button colorPalette="yellow" type="submit">
          <TbDeviceFloppy />
          Save Changes
        </Button>
      </Card.Footer>
    </form>
  );
}
