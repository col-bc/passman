import Navbar from '@/components/navbar';
import { LockerProvider } from '@/hooks/use-locker';
import { getCurrentUser } from '@/lib/session';
import { Box } from '@chakra-ui/react';

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await getCurrentUser();
  return (
    <LockerProvider userEmail={user?.email || ''}>
      <Navbar user={user} />
      <Box as="main" flex={1} bg="bg" color="fg">
        {children}
      </Box>
    </LockerProvider>
  );
}
