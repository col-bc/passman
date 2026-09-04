import AppWrapper from '@/components/appWrapper';
import LockerError from '@/components/presentation/locker/lockerError';
import { LockerProvider } from '@/hooks/use-locker';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { unauthorized } from 'next/navigation';

export default async function SecurityCenterLayout({ children }: { children: React.ReactNode }) {
  const result = await handleGetCurrentUser();

  if (!result.success) {
    if (result.type === 'UNAUTHORIZED') {
      console.warn('User not authenticated, redirecting to sign-in page.');
      unauthorized();
    }
    console.error('Failed to get current user:', result.error);
    return;
  } else if (!result.data) {
    return <LockerError type="NOT_FOUND" text="No current user found." />;
  }

  const user = result.data;

  return (
    <LockerProvider userEmail={user.email}>
      <AppWrapper user={user}>{children}</AppWrapper>
    </LockerProvider>
  );
}
