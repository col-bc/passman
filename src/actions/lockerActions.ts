'use server';

import { EncryptedData } from '@/lib/crypto';
import {
  createLockerItem,
  getLockerById,
  getLockerItem,
  getLockersByOwnerId,
  updateLockerItem,
  updateLockerTitle,
} from '@/lib/lockerDAL';
import { getCurrentUser } from '@/lib/session';
import { Item as EncryptedLockerItem } from '@/prisma/client';
import { ActionState, EncryptedLocker } from '@/types/server';
import { revalidatePath } from 'next/cache';

export async function handleGetLockers(): Promise<ActionState<EncryptedLocker[]>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const lockers = await getLockersByOwnerId(currentUser.id);

  if (lockers.success) {
    return { success: true, data: lockers.data as EncryptedLocker[] };
  } else {
    if (lockers.type === 'NOT_FOUND') {
      return { success: false, error: 'No lockers found', type: 'NOT_FOUND' };
    } else if (lockers.type === 'UNAUTHORIZED') {
      return { success: false, error: 'User not authorized to access lockers', type: 'UNAUTHORIZED' };
    } else if (lockers.type === 'SERVER_ERROR') {
      return { success: false, error: 'Server error while fetching lockers', type: 'SERVER_ERROR' };
    } else {
      return { success: false, error: 'Failed to fetch lockers', type: 'SERVER_ERROR' };
    }
  }
}

export async function handleGetLockerById(lockerId: string): Promise<ActionState<EncryptedLocker>> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const locker = await getLockerById(lockerId);

  if (locker.success) {
    return { success: true, data: locker.data as EncryptedLocker };
  }
  if (locker.type === 'NOT_FOUND') {
    return { success: false, error: 'Locker not found', type: 'NOT_FOUND' };
  } else if (locker.type === 'UNAUTHORIZED') {
    return { success: false, error: 'User not authorized to access locker', type: 'UNAUTHORIZED' };
  } else if (locker.type === 'SERVER_ERROR') {
    return { success: false, error: 'Server error while fetching locker', type: 'SERVER_ERROR' };
  } else {
    return { success: false, error: 'Failed to fetch locker', type: 'SERVER_ERROR' };
  }
}

export async function handleCreateLockerItem(
  lockerId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string; checksum?: string },
): Promise<ActionState<EncryptedLockerItem>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const locker = await getLockerById(lockerId);
  if (!locker.success || !locker.data) {
    return { success: false, error: 'Locker not found', type: 'NOT_FOUND' };
  }
  const result = await createLockerItem(lockerId, currentUser.id, {
    category: data.category,
    title: data.title,
    checksum: data.checksum ?? '',
    iv: new Uint8Array(encryptedData.iv),
    tag: new Uint8Array(encryptedData.tag),
    ownerId: currentUser.id,
    ciphertext: new Uint8Array(encryptedData.ciphertext),
    lockerId: lockerId,
  });

  if (!result.success) {
    return { success: false, error: 'Failed to create locker item', type: 'SERVER_ERROR' };
  }

  revalidatePath(`/locker/${lockerId}`);
  revalidatePath('/app');
  return { success: true, data: result.data as unknown as EncryptedLockerItem };
}

export async function handleGetLockerItem(lockerId: string, itemId: string): Promise<ActionState<EncryptedLockerItem>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const locker = await getLockerItem(lockerId, itemId);
  if (!locker.success || !locker.data) {
    return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
  }

  return { success: true, data: locker.data as EncryptedLockerItem };
}

export async function handleUpdateLockerItem(
  lockerId: string,
  itemId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string; checksum?: string },
): Promise<ActionState<EncryptedLockerItem>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const locker = await getLockerItem(lockerId, itemId);
  if (!locker.success || !locker.data) {
    return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
  }
  const status = await updateLockerItem(lockerId, itemId, {
    category: data.category,
    title: data.title,
    checksum: data.checksum ?? '',
    iv: new Uint8Array(encryptedData.iv),
    tag: new Uint8Array(encryptedData.tag),
    ownerId: currentUser.id,
    ciphertext: new Uint8Array(encryptedData.ciphertext),
  });

  if (!status.success) {
    return { success: false, error: 'Failed to update locker item', type: 'SERVER_ERROR' };
  }
  revalidatePath(`/locker/${lockerId}`);
  revalidatePath('locker');
  return { success: true, data: status.data as unknown as EncryptedLockerItem };
}

export async function handleRenameLocker(lockerId: string, newTitle: string): Promise<ActionState<EncryptedLocker>> {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const status = await updateLockerTitle(lockerId, newTitle);
  if (!status.success) {
    return { success: false, error: 'Failed to rename locker', type: 'SERVER_ERROR' };
  }
  revalidatePath(`/locker/${lockerId}`);
  revalidatePath('/locker');
  return { success: true, data: status.data as unknown as EncryptedLocker };
}
