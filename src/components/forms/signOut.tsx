import { handleSignOutUser } from '@/actions/userActions';
import { Button, ButtonProps } from '@chakra-ui/react';
import React from 'react';
import { TbLogout } from 'react-icons/tb';

export default function SignOutButton(props: ButtonProps) {
  const [loading, setLoading] = React.useState(false);
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    await handleSignOutUser();
  };

  return (
    <form onSubmit={handleSubmit}>
      <Button
        type="submit"
        colorPalette="red"
        variant="outline"
        color="red.fg"
        loading={loading}
        loadingText="Signing Out..."
        {...props}
      >
        <TbLogout size={20} />
        Sign Out
      </Button>
    </form>
  );
}
