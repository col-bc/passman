'use server';

import { getCurrentUser, loginUser } from '@/lib/session';
import { createUser, sendChangePasswordEmail } from '@/lib/user/userDAL';
import { verifyTurnstileToken } from '@/lib/util/turnstile';
import { User } from '@/prisma/client';
import { ActionState } from '@/types/server';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function handleSignUpUser({
  email,
  authHash,
  turnstileToken,
}: {
  email: string;
  authHash: string;
  turnstileToken: string;
}): Promise<ActionState<boolean>> {
  const tsStatus = await verifyTurnstileToken(turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Turnstile verification failed.',
      type: 'VALIDATION',
    };
  }

  const status = await createUser(email, authHash);
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

export async function handleLoginUser({
  email,
  password,
  turnstileToken,
}: {
  email: string;
  password: string;
  turnstileToken: string;
}): Promise<ActionState<void>> {
  const tsStatus = await verifyTurnstileToken(turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Turnstile verification failed.',
      type: 'VALIDATION',
    };
  }
  const currentUser = await loginUser(email, password);
  if (!currentUser) {
    return {
      success: false,
      error: 'Invalid email or password. Please try again.',
      type: 'NOT_FOUND',
    };
  }
  redirect('/locker');
}

export async function handleSignOutUser(): Promise<void> {
  const cookieStore = await cookies();
  // Clear the session cookie by setting it to an empty value and expiring it immediately
  cookieStore.set('session', '', { path: '/', expires: new Date(0) });
  cookieStore.delete('session');

  redirect('/auth/sign-in');
}

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

export async function handleStartChangePassword(email: string, turnstileToken: string): Promise<ActionState<void>> {
  const tsStatus = await verifyTurnstileToken(turnstileToken);
  if (!tsStatus) {
    return {
      success: false,
      error: 'Turnstile verification failed.',
      type: 'VALIDATION',
    };
  }

  const status = await sendChangePasswordEmail(email);
  if (!status.success) {
    return {
      success: false,
      error: 'Failed to send password reset email. Please try again later.',
      type: status.type || 'SERVER_ERROR',
    };
  }
  return {
    success: true,
    data: undefined,
  };
}
