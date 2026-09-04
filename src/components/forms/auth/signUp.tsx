'use client';

import { deriveAuthHash, deriveHexKey } from '@/lib/crypto';
import { handleSignUpUser } from '@/lib/user/userActions';
import { Alert, Button, Checkbox, Field, Flex, Input, Link, Text } from '@chakra-ui/react';
import { Turnstile, TurnstileInstance } from '@marsidev/react-turnstile';
import NextLink from 'next/link';
import { useRouter } from 'next/navigation';
import React from 'react';
import { TbArrowRight, TbExclamationCircleFilled } from 'react-icons/tb';
import zxcvbn from 'zxcvbn';
import { PasswordInput, PasswordStrengthMeter } from '../../ui/password-input';

const formatPhone = (phone: string) => {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  // Format the phone number as (XXX) XXX-XXXX
  if (digits.length <= 3) {
    return digits;
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  }
};

function SignUpForm() {
  const router = useRouter();

  const turnstileRef = React.useRef<TurnstileInstance | null>(null);

  const [name, setName] = React.useState<string>('');
  const [email, setEmail] = React.useState<string>('');
  const [phone, setPhone] = React.useState<string>('');
  const [password, setPassword] = React.useState<string>('');
  const [passwordStrength, setPasswordStrength] = React.useState<number>(0);
  const [passwordFeedback, setPasswordFeedback] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [acceptTerms, setAcceptTerms] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email || !password) {
      setError('Please fill in all required fields.');
      setIsLoading(false);
      turnstileRef.current?.reset();
      return;
    }

    if (passwordStrength < 3) {
      setError('Please choose a stronger password.');
      setIsLoading(false);
      turnstileRef.current?.reset();
      return;
    }
    if (passwordFeedback !== '') {
      setError(`Please fix the problems with your password: ${passwordFeedback}`);
      turnstileRef.current?.reset();
      setIsLoading(false);
      return;
    }
    if (!acceptTerms) {
      setError('You must accept the Terms and Conditions and Privacy Policy.');
      turnstileRef.current?.reset();
      setIsLoading(false);
      return;
    }

    const token = turnstileRef.current?.getResponse();
    if (!token) {
      setError('Please complete the CAPTCHA challenge.');
      turnstileRef.current?.reset();
      setIsLoading(false);
      return;
    }

    try {
      const mek = await deriveHexKey(password, email);
      const authHash = await deriveAuthHash(password, email);

      const result = await handleSignUpUser({
        email,
        authHash,
        turnstileToken: token,
      });

      if (!result.success) {
        setError(result.error || 'An unknown error occurred.');
        turnstileRef.current?.reset();
        setIsLoading(false);
        return;
      }

      router.push('/auth/sign-in?registered=1');
    } catch (err) {
      console.warn('Error during sign-up:', err);
      setError('An error occurred during cryptographic generation.');
      setIsLoading(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { score, feedback } = zxcvbn(e.target.value);
    setPassword(e.target.value);
    setPasswordStrength(score);
    setPasswordFeedback(feedback.warning || '');
  };

  return (
    <form onSubmit={handleSubmit}>
      <Flex direction="column" gap={4}>
        {error && (
          <Alert.Root status="error">
            <Alert.Indicator>
              <TbExclamationCircleFilled size={16} />
            </Alert.Indicator>
            <Alert.Content>
              <Alert.Title>{error}</Alert.Title>
            </Alert.Content>
          </Alert.Root>
        )}

        <Field.Root required colorPalette="yellow">
          <Field.Label>Your Name</Field.Label>
          <Input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="What should we call you (optional)?"
            autoComplete="name"
          />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Email Address <Field.RequiredIndicator />
          </Field.Label>
          <Input
            type="email"
            value={email}
            required
            onChange={(e) => setEmail(e.target.value)}
            placeholder="What is your email address"
            autoComplete="email"
          />
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>Phone Number</Field.Label>
          <Input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            placeholder="What is your phone number (optional)"
            autoComplete="tel"
          />
          <Field.HelperText mt={1}>This is optional, but can be used for account recovery.</Field.HelperText>
        </Field.Root>
        <Field.Root required colorPalette="yellow">
          <Field.Label>
            Password <Field.RequiredIndicator />
          </Field.Label>
          <PasswordInput
            value={password}
            onChange={handlePasswordChange}
            required
            placeholder="Choose a strong master password"
            autoComplete="new-password"
          />
          <Field.HelperText mt={2}>
            <PasswordStrengthMeter value={passwordStrength} />
            {passwordFeedback && (
              <Alert.Root mt={2} size="sm" status="warning" variant="subtle">
                <Alert.Indicator>
                  <TbExclamationCircleFilled size={16} />
                </Alert.Indicator>
                <Alert.Title>{passwordFeedback}</Alert.Title>
              </Alert.Root>
            )}
            <Text fontSize="xs" color="fg.muted" mt={2}>
              Your master password should be strong and unique. Avoid using common words or easily guessable
              information. The strength of your password is crucial for the security of your account and the sensitive
              information you will store in Passman.
            </Text>
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
        />
        <Checkbox.Root
          checked={acceptTerms}
          onCheckedChange={(v) => setAcceptTerms(!!v)}
          colorPalette="yellow"
          mb={4}
          required
          alignItems="flex-start"
        >
          <Checkbox.Control>
            <Checkbox.Indicator />
          </Checkbox.Control>
          <Checkbox.Label lineHeight="normal" fontSize="sm" fontWeight={400}>
            I accept the{' '}
            <Link as={NextLink} href="/terms" color="yellow.fg">
              Terms and Conditions
            </Link>
            and{' '}
            <Link as={NextLink} href="/privacy" color="yellow.fg">
              Privacy Policy
            </Link>
            , and I am at least 18 years old, or of legal age in my jurisdiction to enter into a binding agreement.
          </Checkbox.Label>
          <Checkbox.HiddenInput />
        </Checkbox.Root>
        <Button size="lg" type="submit" loading={isLoading} loadingText="Signing up..." colorPalette="yellow">
          Sign Up <TbArrowRight />
        </Button>
        <Button variant="ghost" colorPalette="yellow" asChild>
          <NextLink href="/auth/sign-in">Already have an account? Sign In</NextLink>
        </Button>
      </Flex>
    </form>
  );
}
SignUpForm.displayName = 'SignUpForm';

export default SignUpForm;
