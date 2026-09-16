'use client';

import { toaster } from '@/components/ui/toaster';
import { handleUpdateUser } from '@/lib/user/userActions';
import { User } from '@/prisma/browser';
import { Button, Card, Field, Input } from '@chakra-ui/react';
import React from 'react';
import { TbDeviceFloppy } from 'react-icons/tb';

const formatPhoneNumber = (phone: string) => {
  // format ###-###-#### as the user types
  const cleaned = ('' + phone).replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phone;
};

export default function AboutYouForm({ user }: { user: User }) {
  const [name, setName] = React.useState(user.name!);
  const [phone, setPhone] = React.useState(user.phone!);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();

    const status = await handleUpdateUser({ name, phone });
    if (!status.success) {
      toaster.error({
        title: 'Error',
        description: 'Failed to update user. Please try again later.',
      });
      return;
    }
    toaster.success({
      title: 'Success',
      description: 'User updated successfully.',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card.Body spaceY={4}>
        <Card.Description>
          You can update your personal information here. Email addresses are tied to your account and cannot be changed
          without contacting support.
        </Card.Description>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Name <Field.RequiredIndicator />
          </Field.Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
        </Field.Root>
        <Field.Root required disabled colorPalette="yellow">
          <Field.Label>
            Email <Field.RequiredIndicator />
          </Field.Label>
          <Input value={user.email!} placeholder="john.doe@example.com" required disabled />
          <Field.HelperText>Contact support to update your email address.</Field.HelperText>
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Phone <Field.RequiredIndicator />
          </Field.Label>
          <Input
            value={phone}
            onChange={(e) => setPhone(formatPhoneNumber(e.target.value))}
            placeholder="123-456-7890"
            required
          />
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
