import { handleSignOutUser } from '@/actions/userActions';
import { Button, ButtonProps } from '@chakra-ui/react';
import { TbLogout } from 'react-icons/tb';

export default function SignOutButton(props: ButtonProps) {
  return (
    <form action={handleSignOutUser}>
      <Button type="submit" colorPalette="red" variant="outline" color="red.fg" {...props}>
        <TbLogout size={20} />
        Sign Out
      </Button>
    </form>
  );
}
