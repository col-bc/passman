import { handleSignOutUser } from '@/lib/user/userActions';
import { Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';
import { TbLogout } from 'react-icons/tb';

export default function SignOutButton(props: ButtonProps) {
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    await handleSignOutUser();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button type="submit" colorPalette="red" variant="outline" color="red.fg" {...props}>
        <TbLogout size={20} />
        Sign Out
      </Button>
    </form>
  );
}
