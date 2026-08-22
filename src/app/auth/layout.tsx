import { handleGetCurrentUser } from '@/actions/userActions';
import Navbar from '@/components/navbar';
import { LockerProvider } from '@/hooks/use-locker';
import { Box } from '@chakra-ui/react';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const result = await handleGetCurrentUser();
  const user = result.success && result.data ? result.data : null;

  return (
    <LockerProvider userEmail={user?.email || ''}>
      <Navbar user={user} />
      <Box as="main" flex={1} bg="bg" color="fg">
        {children}
      </Box>
    </LockerProvider>
  );
}
