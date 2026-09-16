'use client';

import { handleStartChangePassword } from '@/lib/user/userActions';
import { Alert, Button, Card, CloseButton, Field, Input, Spinner } from '@chakra-ui/react';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import Link from 'next/link';
import React from 'react';
import { TbArrowRight, TbCircleCheck, TbExclamationCircle } from 'react-icons/tb';

export default function ForgotPasswordForm() {
  const turnstileRef = React.useRef<TurnstileInstance | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [email, setEmail] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    if (!email) {
      setError('Please enter your email address.');
      return;
    }

    if (!token) {
      setError('Please complete the challenge to verify you are human.');
      return;
    }

    const result = await handleStartChangePassword(email, token);
    console.log(result);
    setSuccess(result.success);
  };

  if (success) {
    return (
      <Card.Root>
        <Card.Header>
          <TbCircleCheck size={32} color="green.fg" />
          <Card.Title>Success</Card.Title>
        </Card.Header>
        <Card.Body spaceY={4}>
          <Card.Description>
            If an account with that email exists, we will send an email with instructions to reset your password.
          </Card.Description>
        </Card.Body>
        <Card.Footer>
          <Button flex={1} colorPalette="yellow" width="full">
            <Link href="/auth/sign-in" passHref>
              Back to Login
            </Link>
          </Button>
        </Card.Footer>
      </Card.Root>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card.Root>
        <Card.Header>
          <Card.Title>Forgot Password</Card.Title>
          <Card.Description>Enter the email address you used to create you Passman account.</Card.Description>
        </Card.Header>
        <Card.Body spaceY={4}>
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
              Email <Field.RequiredIndicator />
            </Field.Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              autoComplete="email"
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
            onSuccess={(token) => setToken(token)}
            onError={(err) => {
              console.error('Turnstile error:', err);
              setError('Turnstile verification failed. Please try again.');
              turnstileRef.current?.reset();
            }}
          />
        </Card.Body>
        <Card.Footer>
          <Button type="submit" flex={1} colorPalette="yellow" width="full" disabled={!token}>
            {token ? (
              <>
                Reset Password <TbArrowRight />
              </>
            ) : (
              <Spinner size="sm" />
            )}
          </Button>
        </Card.Footer>
      </Card.Root>
    </form>
  );
}
