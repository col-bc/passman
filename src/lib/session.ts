'use server';

import { verifyPassword } from '@/lib/util/password';
import { User } from '@/prisma/client';
import { DALResult } from '@/types/server';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import 'server-only';
import { prisma } from './prisma';
import { getUserByEmail } from './user/userDAL';
import { verifyTotp } from './util/twoFactor';

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;

/**
 * Retrieves the current authenticated user based on the session token stored in cookies.
 * @returns {Promise<DALResult<User | null>>} A promise that resolves to the current user or `null`
 */
export async function getCurrentUser(): Promise<DALResult<User | null>> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) {
    return {
      success: false,
      type: 'UNAUTHORIZED',
    };
  }
  const userId = await decodeSessionToken(sessionToken);
  if (!userId) {
    return {
      success: false,
      type: 'UNAUTHORIZED',
    };
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    return {
      success: false,
      type: 'NOT_FOUND',
    };
  }
  return {
    success: true,
    data: user,
  };
}

/**
 * Sets a new session token for the specified user and stores it in the cookies.
 * @param {string} userId - The ID of the user for whom the session token is being set.
 * @returns {Promise<void>} A promise that resolves when the session token has been set.
 */
export async function setSessionToken(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const sessionToken = await generateSessionToken(userId);
  cookieStore.set({
    name: 'session',
    value: sessionToken,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    ...(process.env.NODE_ENV === 'production' && { domain: '.passman.io' }),
  });
}

/**
 * Authenticates a user using their email and password.
 * @param email The email of the user attempting to log in.
 * @param password The password of the user attempting to log in.
 * @returns {Promise<User | null>} A promise that resolves to the authenticated user or `null` if authentication fails.
 */
export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user.success || !user.data) {
    return null;
  }
  const isPasswordValid = await verifyPassword(password, email, user.data.authHash);
  if (!isPasswordValid) {
    return null;
  }
  if (!user.data.enable2FA) {
    await setSessionToken(user.data.id);
  }
  return user.data;
}

/**
 * Validates the one-time password (OTP) for two-factor authentication (2FA) and logs in the user if successful.
 * @param userId The ID of the user attempting to log in with 2FA.
 * @param otp The one-time password (OTP) provided by the user for 2FA authentication.
 * @returns {Promise<User | null>} A promise that resolves to the authenticated user or `null` if authentication fails.
 */
export async function loginUser2FA(userId: string, otp: string): Promise<User | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user || !user.twoFactorSecret) {
    return null;
  }
  const result = await verifyTotp({ secret: user.twoFactorSecret, token: otp });
  if (result === null) {
    return null;
  }
  await setSessionToken(userId);
  return user;
}

// Helper functions for generating and decoding session tokens.

/**
 * Generates a new session token for the specified user.
 * @param userId The ID of the user for whom the session token is being generated.
 * @returns {Promise<string>} A promise that resolves to the generated session token.
 */
const generateSessionToken = async (userId: string): Promise<string> => {
  if (!SESSION_SECRET_KEY) {
    throw new Error('SESSION_SECRET_KEY is not defined');
  }
  const payload = { userId } as jwt.JwtPayload;
  const options = { expiresIn: '1h' } as jwt.SignOptions;
  const token = jwt.sign(payload, SESSION_SECRET_KEY, options);
  return token;
};

/**
 * Decodes a session token to extract the user ID.
 * @param token The session token to decode.
 * @returns {Promise<string | null>} A promise that resolves to the user ID if the token is valid, or `null` if the token is invalid.
 */
const decodeSessionToken = async (token: string): Promise<string | null> => {
  if (!SESSION_SECRET_KEY) {
    throw new Error('SESSION_SECRET_KEY is not defined');
  }
  try {
    const decoded = jwt.verify(token, SESSION_SECRET_KEY) as {
      userId: string;
    };
    return decoded.userId;
  } catch {
    return null;
  }
};
