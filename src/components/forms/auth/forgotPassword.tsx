'use client';

import { Tooltip } from '@/components/ui/tooltip';
import { handleStartChangePassword } from '@/lib/user/userActions';
import { Alert, Box, Button, CloseButton, Field, Flex, IconButton, Input, Spinner } from '@chakra-ui/react';
import NextLink from 'next/link';

import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import React from 'react';
import { TbArrowLeft, TbArrowRight, TbCircleCheck, TbExclamationCircle } from 'react-icons/tb';

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
    if (!result.success) {
      setError(result.error || 'Failed to send password reset email. Please try again later.');
    } else {
      setError(null);
      setSuccess(true);
    }
  };

  return (
    <Box>
      {success ? (
        <Alert.Root status="success">
          <Alert.Indicator>
            <TbCircleCheck size={24} />
          </Alert.Indicator>
          <Alert.Content>
            <Alert.Title>Message Sent</Alert.Title>
            <Alert.Description>
              If an account with that email exists, a password reset link has been sent. Please check your inbox and
              follow the instructions to reset your password. This link will expire in 15 minutes.
            </Alert.Description>
          </Alert.Content>
        </Alert.Root>
      ) : (
        <form onSubmit={handleSubmit}>
          <Flex direction="column" gap={4}>
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
              <Field.HelperText mt={1}>
                This must be the email address you used to register your account
              </Field.HelperText>
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

            <Flex align="center" width="full" gap={2}>
              <Tooltip content="Back to Sign In" positioning={{ placement: 'bottom' }}>
                <NextLink href="/auth/sign-in" passHref>
                  <IconButton aria-label="Back to Sign In" variant="surface">
                    <TbArrowLeft />
                  </IconButton>
                </NextLink>
              </Tooltip>
              <Button type="submit" flex={1} colorPalette="yellow" width="full" disabled={!token}>
                {token ? (
                  <>
                    Reset Password <TbArrowRight />
                  </>
                ) : (
                  <Spinner size="sm" />
                )}
              </Button>
            </Flex>
          </Flex>
        </form>
      )}
    </Box>
  );
}
