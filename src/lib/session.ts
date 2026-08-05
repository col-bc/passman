'use server';

import { verifyPassword } from '@/lib/util/password';
import { User } from '@/prisma/client';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import 'server-only';
import { prisma } from './prisma';
import { getUserByEmail } from './userDAL';

const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY;

export async function getCurrentUser(): Promise<User | null> {
  const cookieStore = await cookies();
  const sessionToken = cookieStore.get('session')?.value;
  if (!sessionToken) {
    return null;
  }
  const userId = await decodeSessionToken(sessionToken);
  if (!userId) {
    return null;
  }
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
}

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

export async function loginUser(email: string, password: string): Promise<User | null> {
  const user = await getUserByEmail(email);
  if (!user.success || !user.data) {
    return null;
  }
  const isPasswordValid = await verifyPassword(password, email, user.data.authHash);
  if (!isPasswordValid) {
    return null;
  }
  await setSessionToken(user.data.id);
  return user.data;
}

const generateSessionToken = async (userId: string): Promise<string> => {
  if (!SESSION_SECRET_KEY) {
    throw new Error('SESSION_SECRET_KEY is not defined');
  }
  const payload = { userId } as jwt.JwtPayload;
  const options = { expiresIn: '1h' } as jwt.SignOptions;
  const token = jwt.sign(payload, SESSION_SECRET_KEY, options);
  return token;
};

const decodeSessionToken = async (token: string): Promise<string | null> => {
  if (!SESSION_SECRET_KEY) {
    throw new Error('SESSION_SECRET_KEY is not defined');
  }
  try {
    const decoded = jwt.verify(token, SESSION_SECRET_KEY) as {
      userId: string;
    };
    return decoded.userId;
  } catch (error) {
    console.error('Error decoding session token:', error);
    return null;
  }
};
