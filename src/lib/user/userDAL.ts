import { User } from '@/prisma/client';
import { DALResult } from '@/types/server';
import crypto from 'node:crypto';
import 'server-only';
import { prisma } from '../prisma';
import { hashPassword } from '../util/password';
import { generateRecoveryCodes, verifyTotp } from '../util/twoFactor';

export async function getUserById(userId: string): Promise<DALResult<User | null>> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });
    if (user) {
      return { success: true, data: user };
    } else {
      return { success: false, type: 'NOT_FOUND' };
    }
  } catch (error) {
    console.error('[userDAL] getUserById failed to fetch user by ID:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function getUserByEmail(email: string): Promise<DALResult<User | null>> {
  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    if (user) {
      return { success: true, data: user };
    } else {
      return { success: false, type: 'NOT_FOUND' };
    }
  } catch (error) {
    console.error('[userDAL] getUserByEmail failed to fetch user by email:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

const createDefaultVault = (userId: string) => {
  try {
    // Create a default vault for the user
    return prisma.vault.create({
      data: {
        title: 'Default Vault',
        ownerId: userId,
      },
    });
  } catch (error) {
    console.error('[userDAL] createDefaultVault failed to create default vault:', error);
    throw error;
  }
};

export async function createUser(
  email: string,
  crypto: {
    authHash: string;
    publicKey: string;
    encryptedPrivateKey: string;
  },
  data: {
    name: string;
    phone: string;
  },
): Promise<DALResult<{ success: boolean; message: string }>> {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, type: 'VALIDATION' };
  }

  const existingUser = await getUserByEmail(email);
  if (existingUser.success && existingUser.data) {
    return { success: false, type: 'CONFLICT' };
  }

  const passwordToken = await hashPassword(crypto.authHash, email);

  try {
    const newUser = await prisma.user.create({
      data: {
        authHash: passwordToken,
        email,
        publicKey: crypto.publicKey,
        encryptedPrivateKey: crypto.encryptedPrivateKey,
        name: data.name,
        phone: data.phone,
      },
    });

    if (!newUser) {
      return { success: false, type: 'SERVER_ERROR' };
    }

    await createDefaultVault(newUser.id);

    return {
      success: true,
      data: { success: true, message: 'User created successfully' },
    };
  } catch (error) {
    console.error('[userDAL] createUser failed to create user:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
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
  try {
    await prisma.user.update({
      where: { id: user.data.id },
      data: { authHash: newHashedPassword, securityToken: null },
    });

    return { success: true, data: user.data };
  } catch (error) {
    console.error('[userDAL] updateUserPassword failed to update password:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
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
  id: string,
  updates: { name?: string; phone?: string },
): Promise<DALResult<{ success: boolean; message: string }>> {
  try {
    const user = await getUserById(id);
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
  } catch (error) {
    console.error('[userDAL] updateUser failed to update user:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function deleteUser(userId: string): Promise<DALResult<{ success: boolean; message: string }>> {
  const user = await getUserById(userId);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }
  try {
    await prisma.user.delete({
      where: { id: user.data.id },
    });

    return {
      success: true,
      data: { success: true, message: 'User deleted successfully' },
    };
  } catch (error) {
    console.error('[userDAL] deleteUser failed to delete user:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

// TODO: Implement actual email sending logic for password reset
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
    success: false,
    type: 'SERVER_ERROR',
  };
}

export async function enableTwoFactor(
  userId: string,
  secret: string,
  otpCode: string,
): Promise<DALResult<{ success: boolean; message: string }>> {
  const user = await getUserById(userId);
  if (!user.success || !user.data) {
    return { success: false, type: 'NOT_FOUND' };
  }

  const verify = await verifyTotp({ secret, token: otpCode });
  if (verify === null) {
    return {
      success: false,
      type: 'VALIDATION',
    };
  }

  const recoveryCodes = await generateRecoveryCodes();

  try {
    await prisma.user.update({
      where: { id: user.data.id },
      data: { enable2FA: true, twoFactorSecret: secret, recoveryCodes: recoveryCodes.join(',') },
    });

    return {
      success: true,
      data: { success: true, message: 'Two-factor authentication enabled successfully' },
    };
  } catch (error) {
    console.error('[userDAL] enableTwoFactor failed to enable 2FA:', error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}
