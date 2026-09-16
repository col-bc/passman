'use server';

import { getCurrentUser, loginUser, loginUser2FA } from '@/lib/session';
import {
  createUser,
  enableTwoFactor,
  getUserByEmail,
  getUserById,
  sendChangePasswordEmail,
  updateUser,
} from '@/lib/user/userDAL';
import { verifyTurnstileToken } from '@/lib/util/turnstile';
import { User } from '@/prisma/client';
import { ActionState } from '@/types/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { generateTwoFactorSecret, getTotpAuthScheme } from '../util/twoFactor';

/**
 * Server action for handling the sign-up process for a new user.
 * @param userData An object containing the email, authHash, and turnstileToken for the new user.
 * @returns {Promise<ActionState<boolean>>} A promise that resolves to the result of the sign-up operation.
 */
export async function handleSignUpUser({
  email,
  crypto,
  data,
}: {
  email: string;
  crypto: {
    authHash: string;
    publicKey: string;
    encryptedPrivateKey: string;
  };
  data: {
    name: string;
    phone: string;
    turnstileToken: string;
  };
}): Promise<ActionState<boolean>> {
  const tsStatus = await verifyTurnstileToken(data.turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Turnstile verification failed.',
      type: 'VALIDATION',
    };
  }

  const status = await createUser(email, crypto, data);
  if (!status.success) {
    if (status.type === 'CONFLICT') {
      return {
        success: false,
        error: 'This email is already in use. Please sign in or continue with another email.',
        type: 'CONFLICT',
      };
    }
    if (status.type === 'VALIDATION') {
      return {
        success: false,
        error: 'Missing or invalid fields. Please check your input and try again.',
        type: 'VALIDATION',
      };
    }
    return {
      success: false,
      error: 'User creation failed.',
      type: status.type || 'SERVER_ERROR',
    };
  }

  return {
    success: true,
    data: true,
  };
}

/**
 * Server action for handling the login process for an existing user.
 * @param userData An object containing the email, password, and turnstileToken for the user attempting to log in.
 * @returns {Promise<ActionState<{ twoFactor: boolean }>>} A promise that resolves to the result of the login operation, including whether two-factor authentication is enabled.
 */
export async function handleLoginUser({
  email,
  password,
  turnstileToken,
}: {
  email: string;
  password: string;
  turnstileToken: string;
}): Promise<ActionState<{ twoFactor: boolean }>> {
  const cookieJar = await cookies();
  const tsStatus = await verifyTurnstileToken(turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Security challenge failed. Please try again.',
      type: 'VALIDATION',
    };
  }

  const currentUser = await loginUser(email, password);
  if (!currentUser) {
    return {
      success: false,
      error: 'Invalid email or password.',
      type: 'VALIDATION',
    };
  }

  cookieJar.set('pre-auth-id', currentUser.id, {
    path: '/',
    httpOnly: true,
    sameSite: 'strict',
  });

  return {
    success: true,
    data: {
      twoFactor: currentUser.enable2FA,
    },
  };
}

/**
 * Server action for handling the two-factor authentication (2FA) login process for an existing user.
 * @param otp The one-time password (OTP) provided by the user for two-factor authentication (2FA).
 * @returns {Promise<ActionState<boolean>>} A promise that resolves to the result of the 2FA login operation.
 */
export async function handleLogin2FA(otp: string): Promise<ActionState<boolean>> {
  const cookieJar = await cookies();
  const cookieUserId = cookieJar.get('pre-auth-id')?.value;
  if (!cookieUserId) {
    return {
      success: false,
      error: 'User not found in pre-auth cookie.',
      type: 'VALIDATION',
    };
  }

  const user = await loginUser2FA(cookieUserId, otp);
  if (!user) {
    return {
      success: false,
      error: 'Invalid one-time code. Please try again.',
      type: 'VALIDATION',
    };
  }

  cookieJar.delete('pre-auth-id');

  return {
    success: true,
    data: true,
  };
}

/**
 * Server action for handling the sign-out process for the current user.
 * @returns {Promise<void>} A promise that resolves when the user has been signed out.
 */
export async function handleSignOutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Clear the session cookie by setting it to an empty value and expiring it immediately
  cookieStore.set('session', '', { path: '/', expires: new Date(0) });
  cookieStore.delete('session');

  redirect('/auth/sign-in');
}

/**
 * Server action for retrieving the current user's information.
 * @returns {Promise<ActionState<User | null>>} A promise that resolves to the current user's information or `null` if not authenticated.
 */
export async function handleGetCurrentUser(): Promise<ActionState<User | null>> {
  const user = await getCurrentUser();
  if (!user.success) {
    return {
      success: false,
      type: user.type || 'SERVER_ERROR',
      error: 'The user could not be retrieved. Please try again later.',
    };
  } else {
    return {
      success: true,
      data: user.data,
    };
  }
}

/**
 * Server action for retrieving a specific user's information by their user ID.
 * @param userId The ID of the user to retrieve.
 * @returns {Promise<ActionState<User | null>>} A promise that resolves to the user's information or `null` if not found.
 */
export async function handleGetUser(userId: string): Promise<ActionState<User | null>> {
  const user = await getUserById(userId);
  if (!user.success) {
    return {
      success: false,
      type: user.type || 'SERVER_ERROR',
      error: 'The user could not be retrieved. Please try again later.',
    };
  } else {
    return {
      success: true,
      data: user.data,
    };
  }
}

/**
 * Server action for initiating the password change process for the current user.
 * @param email The email of the user requesting a password change.
 * @param turnstileToken The Turnstile token for CAPTCHA verification.
 * @returns {Promise<ActionState<void>>} A promise that resolves to the result of the password change initiation process.
 */
export async function handleStartChangePassword(email: string, turnstileToken: string): Promise<ActionState<string>> {
  const response = {
    success: true,
    data: 'If an account with that email exists, we will send an email with instructions to reset your password.',
  } as ActionState<string>;

  const tsStatus = await verifyTurnstileToken(turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Turnstile verification failed.',
      type: 'VALIDATION',
    };
  }

  const user = await getUserByEmail(email);
  if (!user.success) {
    return response;
  }
  const status = await sendChangePasswordEmail(user.data!.email);
  if (!status.success) {
    return response;
  }
  return response;
}

/**
 * Server action for updating the current user's profile information.
 * @param dataData An object containing the optional name and phone fields to update.
 * @returns {Promise<ActionState<void>>} A promise that resolves to the result of the update operation.
 */
export async function handleUpdateUser({ name, phone }: { name?: string; phone?: string }): Promise<ActionState<void>> {
  const user = await handleGetCurrentUser();
  if (!user.success) {
    return {
      success: false,
      error: 'Failed to retrieve current user. Please try again later.',
      type: user.type || 'SERVER_ERROR',
    };
  }
  const status = await updateUser(user.data!.id, { name, phone });
  if (!status.success) {
    return {
      success: false,
      error: 'Failed to update user. Please try again later.',
      type: status.type || 'SERVER_ERROR',
    };
  }
  return {
    success: true,
    data: undefined,
  };
}

/**
 * Returns an OTP URI for two-factor authentication setup for the current authenticated user
 * @returns An ActionState containing the OTP URI for two-factor authentication setup if successful.
 */
export async function getTwoFactorEnrollmentURI(): Promise<ActionState<{ uri: string; secret: string }>> {
  const user = await handleGetCurrentUser();
  if (!user.success) {
    return {
      success: false,
      error: 'Failed to retrieve current user. Please try again later.',
      type: user.type || 'SERVER_ERROR',
    };
  }
  const secret = await generateTwoFactorSecret();
  const uri = await getTotpAuthScheme({ label: 'Passman', secret: secret });

  return {
    success: true,
    data: { uri, secret },
  };
}

/**
 * Server action for enrolling the current user in two-factor authentication (2FA).
 * @param secret The secret key for 2FA enrollment.
 * @param otpCode The one-time password (OTP) provided by the user for 2FA authentication.
 * @returns {Promise<ActionState<void>>} A promise that resolves to the result of the 2FA enrollment operation.
 */
export async function handleEnrollTwoFactor(secret: string, otpCode: string): Promise<ActionState<void>> {
  const user = await handleGetCurrentUser();
  if (!user.success) {
    return {
      success: false,
      error: 'Failed to retrieve current user. Please try again later.',
      type: user.type || 'SERVER_ERROR',
    };
  }
  const status = await enableTwoFactor(user.data!.id, secret, otpCode);
  if (!status.success) {
    return {
      success: false,
      error: 'Failed to enroll in two-factor authentication. Please try again later.',
      type: status.type || 'SERVER_ERROR',
    };
  }
  revalidatePath('/profile');
  return {
    success: true,
    data: undefined,
  };
}
