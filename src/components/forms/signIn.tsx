'use client';
import { handleLoginUser } from '@/actions/userActions';
import { useLocker } from '@/hooks/use-locker';
import { deriveAuthHash, deriveHexKey } from '@/lib/crypto';
import { Alert, Button, CloseButton, Field, Flex, Input } from '@chakra-ui/react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { TbArrowRight, TbCircleCheckFilled, TbExclamationCircle } from 'react-icons/tb';
import { PasswordInput } from '../ui/password-input';

export default function SignInForm() {
  const { setMek } = useLocker();
  const router = useRouter();
  const searchParams = useSearchParams();

  const turnstileRef = React.useRef<TurnstileInstance | null>(null);

  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const nextUrl = searchParams.get('next') || '/locker';

  const clearSearchParams = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete('registered');
    router.replace(url.toString());
  };

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      return;
    }

    const turnstileToken = await turnstileRef.current?.getResponse();
    if (!turnstileToken) {
      setError('Turnstile verification failed. Please try again.');
      setIsLoading(false);
      return;
    }

    const mek = await deriveHexKey(password, email);
    const authHash = await deriveAuthHash(password, email);

    const status = await handleLoginUser({ email, password: authHash, turnstileToken });
    if (!status.success) {
      console.debug('Login failed:', status);
      setError(status.error || 'An unknown error occurred.');
      turnstileRef.current?.reset();
      setPassword('');
      setIsLoading(false);
      return;
    }

    setMek(mek);

    setIsLoading(false);
    router.push(nextUrl);
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={4}>
        {searchParams.get('registered') && (
          <Alert.Root status="success" size="sm" variant="subtle">
            <Alert.Indicator>
              <TbCircleCheckFilled size={24} />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Registration Successful</Alert.Title>
              <Alert.Description>Your account has been created. Please sign in to continue.</Alert.Description>
            </Alert.Content>
            <CloseButton onClick={() => clearSearchParams()} />
          </Alert.Root>
        )}
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator>
              <TbExclamationCircle size={24} />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>Login Failed</Alert.Title>
              <Alert.Description>{error}</Alert.Description>
            </Alert.Content>
            <CloseButton onClick={() => setError(null)} />
          </Alert.Root>
        )}
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Email Address <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email address"
            autoComplete="email"
            required
          />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            autoComplete="current-password"
            required
          />
        </Field.Root>

        <Turnstile
          ref={turnstileRef}
          siteKey="0x4AAAAAAD9otpku29Q-MK7g"
          options={{
            appearance: 'interaction-only',
            theme: 'auto',
            feedbackEnabled: true,
            size: 'flexible',
          }}
        />

        <Button size="lg" type="submit" my={2} loading={isLoading} loadingText="Signing in..." colorPalette="yellow">
          Sign In <TbArrowRight />
        </Button>
        <Flex align="center">
          <Button variant="ghost" colorPalette="yellow" size="sm" flex={1} asChild>
            <Link href="/auth/forgot-password">Forgot Password?</Link>
          </Button>
          <Button variant="ghost" colorPalette="yellow" size="sm" flex={1} asChild>
            <Link href="/auth/sign-up">Create Account</Link>
          </Button>
        </Flex>
      </Flex>
    </form>
  );
}
