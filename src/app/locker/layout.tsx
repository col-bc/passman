import AppWrapper from '@/components/appWrapper';
import { LockerProvider } from '@/hooks/use-locker';
import { getCurrentUser } from '@/lib/session';
import { unauthorized } from 'next/navigation';

export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    console.warn('User not authenticated, redirecting to sign-in page.');
    unauthorized();
  }

  return (
    <LockerProvider userEmail={user?.email || ''}>
      <AppWrapper user={user!}>{children}</AppWrapper>
    </LockerProvider>
  );
}
