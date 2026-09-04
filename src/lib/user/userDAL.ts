import { User } from '@/prisma/client';
import { DALResult } from '@/types/server';
import crypto from 'node:crypto';
import 'server-only';
import { prisma } from '../prisma';
import { hashPassword } from '../util/password';

export async function getUserById(userId: string): Promise<DALResult<User | null>> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (user) {
    return { success: true, data: user };
  } else {
    return { success: false, type: 'NOT_FOUND' };
  }
}

export async function getUserByEmail(email: string): Promise<DALResult<User | null>> {
  const user = await prisma.user.findUnique({
    where: { email },
  });
  if (user) {
    return { success: true, data: user };
  } else {
    return { success: false, type: 'NOT_FOUND' };
  }
}

const initializeUserLockers = (userId: string) => {
  // Create a default locker for the user
  return prisma.locker.create({
    data: {
      title: 'Default Locker',
      ownerId: userId,
    },
  });
};

export async function createUser(
  email: string,
  authHash: string,
): Promise<DALResult<{ success: boolean; message: string }>> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, type: 'VALIDATION' };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser.success && existingUser.data) {
    return { success: false, type: 'CONFLICT' };
  }

  const passwordToken = await hashPassword(authHash, email);

  const newUser = await prisma.user.create({
    data: {
      authHash: passwordToken,
      email,
    },
  });

  if (!newUser) {
    return { success: false, type: 'SERVER_ERROR' };
  }

  await initializeUserLockers(newUser.id);

  return {
    success: true,
    data: { success: true, message: 'User created successfully' },
  };
}

export async function updateUserPassword(
  email: string,
  securityToken: string,
  newHashedPassword: string,
): Promise<DALResult<User | null>> {
  const user = await getUserByEmail(email);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }
  if (user.data.securityToken !== securityToken) {
    return { success: false, type: 'VALIDATION' };
  }

  await prisma.user.update({
    where: { id: user.data.id },
    data: { authHash: newHashedPassword, securityToken: null },
  });

  return { success: true, data: user.data };
}

const generateRandomToken = (length: number = 64): string => {
  return crypto.randomBytes(length).toString('hex');
};

export async function generateAndStoreSecurityToken(
  email: string,
): Promise<DALResult<{ success: boolean; message: string; token?: string }>> {
  const user = await getUserByEmail(email);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }

  const token = generateRandomToken();
  await prisma.user.update({
    where: { id: user.data.id },
    data: { securityToken: token },
  });

  return {
    success: true,
    data: { success: true, message: 'Security token generated', token },
  };
}

export async function updateUser(
  email: string,
  updates: Partial<User>,
): Promise<DALResult<{ success: boolean; message: string }>> {
  const user = await getUserByEmail(email);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }

  await prisma.user.update({
    where: { id: user.data.id },
    data: updates,
  });

  return {
    success: true,
    data: { success: true, message: 'User updated successfully' },
  };
}

export async function deleteUser(userId: string): Promise<DALResult<{ success: boolean; message: string }>> {
  const user = await getUserById(userId);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }

  await prisma.user.delete({
    where: { id: user.data.id },
  });

  return {
    success: true,
    data: { success: true, message: 'User deleted successfully' },
  };
}

export async function sendChangePasswordEmail(
  email: string,
): Promise<DALResult<{ success: boolean; message: string }>> {
  const tokenResult = await generateAndStoreSecurityToken(email);
  if (!tokenResult.success || !tokenResult.data?.token) {
    return { success: false, type: 'VALIDATION' };
  }

  const token = tokenResult.data.token;
  const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/auth/reset-password?email=${encodeURIComponent(
    email,
  )}&token=${encodeURIComponent(token)}`;

  console.log(`[userDAL] Password reset link for ${email}: ${resetLink}`);

  return {
    success: true,
    data: { success: true, message: 'Password reset email sent successfully' },
  };
}
