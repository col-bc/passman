import AppWrapper from '@/components/appWrapper';
import VaultError from '@/components/presentation/vault/vaultError';
import { VaultProvider } from '@/hooks/use-vaults';
import { handleGetCurrentUser } from '@/lib/user/userActions';
import { unauthorized } from 'next/navigation';

export default async function AppRootLayout({ children }: { children: React.ReactNode }) {
  const result = await handleGetCurrentUser();
  if (!result.success) {
    if (result.type === 'UNAUTHORIZED') {
      console.warn('User not authenticated, redirecting to sign-in page.');
      unauthorized();
    }
    return <VaultError type={result.type} text={result.error} />;
  } else if (!result.data) {
    return <VaultError type="NOT_FOUND" text="No current user found." />;
  }

  const user = result.data;

  return (
    <VaultProvider userEmail={user.email}>
      <AppWrapper user={user}>{children}</AppWrapper>
    </VaultProvider>
  );
}
