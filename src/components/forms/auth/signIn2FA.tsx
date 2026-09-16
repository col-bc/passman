'use client';

import { useLocker } from '@/hooks/use-vaults';
import { handleLogin2FA } from '@/lib/user/userActions';
import { Alert, Button, Card, Field, Flex, IconButton, PinInput, Spinner } from '@chakra-ui/react';
import { useRouter, useSearchParams } from 'next/navigation';
import React from 'react';
import { TbAlertCircleFilled, TbArrowLeft, TbArrowRight } from 'react-icons/tb';

export default function SignIn2FAForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { setMek } = useLocker();

  const [otp, setOtp] = React.useState<string[]>(['', '', '', '', '', '']);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const isOtpComplete = otp.every((digit) => digit !== '');

  async function handleSubmit(e: React.SubmitEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (otp.some((digit) => digit === '')) {
      setError('Please enter the complete 6-digit code.');
      return;
    }

    setLoading(true);
    const status = await handleLogin2FA!(otp.join(''));
    if (status.success && status.data) {
      // Login was successful.
      const mekCache = localStorage.getItem('mekAttempt');
      if (mekCache) {
        setMek(mekCache);
        localStorage.removeItem('mekAttempt');
      } else {
        const errorMsg = 'Encryption key was lost during sign in. Please try again.';
        setError(errorMsg);
      }
      router.push(searchParams.get('next') || '/locker');
    }
    if (!status.success) {
      setError(status.error || 'An unknown error occurred.');
      setOtp(['', '', '', '', '', '']);
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <Card.Body>
        <Flex justifyContent="center" alignItems="center" py={8}>
          <Spinner />
        </Flex>
      </Card.Body>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card.Body>
        {error && (
          <Alert.Root status="error" mb={4}>
            <Alert.Indicator as={TbAlertCircleFilled} />
            <Alert.Description>{error}</Alert.Description>
          </Alert.Root>
        )}
        <Field.Root colorPalette="yellow">
          <Field.Label>
            One Time Code <Field.RequiredIndicator />
          </Field.Label>
          <PinInput.Root value={otp} onValueChange={(v) => setOtp(v.value)} required otp>
            <PinInput.HiddenInput />
            <PinInput.Control>
              <PinInput.Input index={0} />
              <PinInput.Input index={1} />
              <PinInput.Input index={2} />
              <PinInput.Input index={3} />
              <PinInput.Input index={4} />
              <PinInput.Input index={5} />
            </PinInput.Control>
          </PinInput.Root>
          <Field.HelperText>Enter the 6-digit code from your code generator application.</Field.HelperText>
        </Field.Root>
      </Card.Body>
      <Card.Footer>
        <Flex justifyContent="space-between" w="full" gap={4}>
          <IconButton onClick={() => router.push('/auth/sign-in')} variant="subtle">
            <TbArrowLeft />
          </IconButton>
          <Button size="lg" type="submit" colorPalette="yellow" px={8} disabled={!isOtpComplete}>
            Verify Code <TbArrowRight />
          </Button>
        </Flex>
      </Card.Footer>
    </form>
  );
}
