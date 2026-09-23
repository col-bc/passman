'use client';

import { PasswordInput } from '@/components/ui/password-input';
import { useVaults } from '@/hooks/use-vaults';
import { deriveAuthHash, deriveHexKey } from '@/lib/crypto';
import { handleLoginUser } from '@/lib/user/userActions';
import { Alert, Button, Card, CloseButton, Field, Flex, Input, Link, Spinner, VStack } from '@chakra-ui/react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import NextLink from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { TbArrowRight, TbCircleCheckFilled, TbExclamationCircle } from 'react-icons/tb';

export default function SignInForm() {
  const { setMek } = useVaults();
  const router = useRouter();
  const searchParams = useSearchParams();

  const turnstileRef = React.useRef<TurnstileInstance | null>(null);

  const [tsToken, setTsToken] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const nextUrl = searchParams.get('next') || '/vaults';

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

    if (!tsToken) {
      setError('Please complete the challenge to verify you are human.');
      setIsLoading(false);
      return;
    }
    const turnstileToken = tsToken;

    const mek = await deriveHexKey(password, email);
    const authHash = await deriveAuthHash(password, email);

    localStorage.setItem('mekAttempt', mek);
    const status = await handleLoginUser({ email, password: authHash, turnstileToken });
    if (!status.success) {
      // Login failed.
      localStorage.removeItem('mekAttempt');
      setError(status.error || 'An unknown error occurred.');
      turnstileRef.current?.reset();
      setPassword('');
      setIsLoading(false);
      return;
    }
    if (!status.data?.twoFactor) {
      // login successful without two-factor authentication
      setMek(mek);
      localStorage.removeItem('mekAttempt');
      setIsLoading(false);
      router.push(nextUrl);
    }
    if (status.data?.twoFactor) {
      // login requires two-factor authentication
      setIsLoading(false);
      router.push(`/auth/sign-in/verify?next=${encodeURIComponent(nextUrl)}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <Card.Body>
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
              autoCapitalize="none"
              autoCorrect="off"
              tabIndex={1}
              required
            />
          </Field.Root>

          <Field.Root required colorPalette="yellow">
            <Flex justify="space-between" align="center" mb={2} w="full">
              <Field.Label>
                Password <Field.RequiredIndicator />
              </Field.Label>
              <Link as={NextLink} href="/auth/forgot-password" fontSize="xs" tabIndex={5}>
                Forgot Password?
              </Link>
            </Flex>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoComplete="current-password"
              tabIndex={2}
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
            onSuccess={(token) => setTsToken(token)}
            onError={() => {
              setError('Turnstile verification failed. Please try again.');
              turnstileRef.current?.reset();
            }}
            style={{
              marginTop: '1rem',
              width: '100%',
            }}
          />
        </Flex>
      </Card.Body>
      <Card.Footer>
        <VStack gap={4} w="full">
          <Button
            size="lg"
            type="submit"
            w="full"
            loading={isLoading}
            disabled={!tsToken}
            colorPalette="yellow"
            tabIndex={3}
          >
            {tsToken ? (
              <>
                Sign In <TbArrowRight />
              </>
            ) : (
              <>
                <Spinner size="sm" /> Getting ready...
              </>
            )}
          </Button>
          <Link as={NextLink} href="/auth/sign-up" colorPalette="yellow">
            Don&apos;t have an account? Sign Up
          </Link>
        </VStack>
      </Card.Footer>
    </form>
  );
}
