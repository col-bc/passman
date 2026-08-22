/**
 * Locker Actions
 *
 * This module contains server actions for managing lockers and locker items.
 */

'use server';

import { EncryptedData } from '@/lib/crypto';
import {
  createLocker,
  createLockerItem,
  deleteLockerItem,
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
import React from 'react';

/**
 * Get the current authenticated user.
 * @returns {Promise<{ id: string } | null>} The current user or null if not authenticated.
 */
const getUser = React.cache(async (): Promise<{ id: string } | null> => {
  const userStatus = await getCurrentUser();
  if (!userStatus.success) {
    return null;
  }
  return userStatus.data;
});

/**
 * Create a new locker for the current user.
 * @param title The title of the new locker.
 * @returns {Promise<ActionState<EncryptedLocker>>} The action state containing the newly created encrypted locker.
 */
export async function handleCreateLocker(title: string): Promise<ActionState<EncryptedLocker>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const result = await createLocker(currentUser.id, title);
  if (!result.success) {
    return { success: false, error: 'Failed to create locker', type: 'SERVER_ERROR' };
  }
  revalidatePath('/locker');
  return { success: true, data: result.data as EncryptedLocker };
}

/**
 * Get all lockers for the current user.
 * @returns {Promise<ActionState<EncryptedLocker[]>>} The action state containing the list of encrypted lockers.
 */
export async function handleGetLockers(): Promise<ActionState<EncryptedLocker[]>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const lockers = await getLockersByOwnerId(currentUser.id);

  if (lockers.success) {
    return { success: true, data: lockers.data as EncryptedLocker[] };
  } else {
    if (lockers.type === 'NOT_FOUND') {
      return { success: false, error: 'No record found matching the criteria', type: 'NOT_FOUND' };
    } else if (lockers.type === 'UNAUTHORIZED') {
      return { success: false, error: 'No authorization for this record.', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
}

/**
 * Get a locker by its ID for the current user.
 * @param lockerId The ID of the locker to retrieve.
 * @returns {Promise<ActionState<EncryptedLocker>>} The action state containing the encrypted locker.
 */
export async function handleGetLockerById(lockerId: string): Promise<ActionState<EncryptedLocker>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const locker = await getLockerById(lockerId);

  if (locker.success) {
    return { success: true, data: locker.data as EncryptedLocker };
  }
  if (locker.type === 'NOT_FOUND') {
    return { success: false, error: 'No record found matching the criteria', type: 'NOT_FOUND' };
  } else if (locker.type === 'UNAUTHORIZED') {
    return { success: false, error: 'No authorization for this record.', type: 'UNAUTHORIZED' };
  } else {
    return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
  }
}

/**
 * Rename a locker for the current user.
 * @param lockerId The ID of the locker to rename.
 * @param newTitle The new title for the locker.
 * @returns {Promise<ActionState<EncryptedLocker>>} The action state containing the updated encrypted locker.
 */
export async function handleRenameLocker(lockerId: string, newTitle: string): Promise<ActionState<EncryptedLocker>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const result = await updateLockerTitle(lockerId, newTitle);
  if (!result.success) {
    return { success: false, error: 'Failed to rename locker', type: 'SERVER_ERROR' };
  }
  revalidatePath(`/locker/${lockerId}`);
  revalidatePath('/locker');
  return { success: true, data: result.data as unknown as EncryptedLocker };
}

// Locker Item Actions

/**
 * Create a new locker item for the specified locker.
 * @param lockerId The ID of the locker to add the item to.
 * @param encryptedData The encrypted data for the locker item.
 * @param data The metadata for the locker item, including category and title.
 * @returns {Promise<ActionState<{ lockerId: string; itemId: string }>>} The action state containing the locker ID and the newly created item ID.
 */
export async function handleCreateLockerItem(
  lockerId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string },
): Promise<ActionState<{ lockerId: string; itemId: string }>> {
  const status = await getCurrentUser();
  if (!status.success) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const currentUser = status.data;
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
    iv: new Uint8Array(encryptedData.iv),
    tag: new Uint8Array(encryptedData.tag),
    ownerId: currentUser.id!,
    ciphertext: new Uint8Array(encryptedData.ciphertext),
    lockerId: lockerId,
    isCompromised: false,
    lastScan: null,
  });

  if (!result.success) {
    return { success: false, error: 'Failed to create locker item', type: 'SERVER_ERROR' };
  }

  revalidatePath(`/locker/${lockerId}`);
  revalidatePath(`/locker/${lockerId}/item/${result.data.itemId}`);
  return { success: true, data: { lockerId: lockerId, itemId: result.data?.itemId || '' } };
}

/**
 * Get a locker item by its ID for the specified locker.
 * @param lockerId The ID of the locker containing the item.
 * @param itemId The ID of the locker item to retrieve.
 * @returns {Promise<ActionState<EncryptedLockerItem>>} The action state containing the encrypted locker item.
 */
export async function handleGetLockerItem(lockerId: string, itemId: string): Promise<ActionState<EncryptedLockerItem>> {
  const status = await getCurrentUser();
  if (!status.success || !status.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const locker = await getLockerItem(lockerId, itemId);
  if (!locker.success) {
    if (locker.type === 'NOT_FOUND') {
      return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  return { success: true, data: locker.data as EncryptedLockerItem };
}

/**
 * Update a locker item for the specified locker.
 * @param lockerId The ID of the locker containing the item.
 * @param itemId The ID of the locker item to update.
 * @param encryptedData The new encrypted data for the locker item.
 * @param data The new metadata for the locker item, including category and title.
 * @returns {Promise<ActionState<{ lockerId: string; itemId: string }>>} The action state containing the locker ID and the updated item ID.
 */
export async function handleUpdateLockerItem(
  lockerId: string,
  itemId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string },
): Promise<ActionState<{ lockerId: string; itemId: string }>> {
  const status = await getCurrentUser();
  if (!status.success || !status.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const currentUser = status.data;

  const locker = await getLockerItem(lockerId, itemId);
  if (!locker.success) {
    if (locker.type === 'NOT_FOUND') {
      return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  const result = await updateLockerItem(lockerId, itemId, {
    category: data.category,
    title: data.title,
    iv: new Uint8Array(encryptedData.iv),
    tag: new Uint8Array(encryptedData.tag),
    ownerId: currentUser.id,
    ciphertext: new Uint8Array(encryptedData.ciphertext),
  });

  if (!result.success) {
    if (result.type === 'NOT_FOUND') {
      return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
    } else if (result.type === 'UNAUTHORIZED') {
      return { success: false, error: 'User not authorized to update this locker item', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  revalidatePath(`/locker/${lockerId}`);
  revalidatePath(`/locker/${lockerId}/item/${result.data.itemId}`);
  return { success: true, data: { lockerId: lockerId, itemId: result.data?.itemId || '' } };
}

/**
 * Handle the deletion of a locker item for the specified locker.
 * @param lockerId The ID of the locker containing the item.
 * @param itemId The ID of the locker item to delete.
 * @returns {Promise<ActionState<boolean>>} The action state indicating whether the deletion was successful.
 */
export async function handleDeleteLockerItem(lockerId: string, itemId: string): Promise<ActionState<boolean>> {
  const currentUserStatus = await getCurrentUser();
  if (!currentUserStatus.success || !currentUserStatus.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const status = await deleteLockerItem(lockerId, itemId);
  if (!status.success) {
    if (status.type === 'NOT_FOUND') {
      return { success: false, error: 'Locker item not found', type: 'NOT_FOUND' };
    } else if (status.type === 'UNAUTHORIZED') {
      return { success: false, error: 'User not authorized to delete this locker item', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }

  revalidatePath(`/locker`);
  revalidatePath(`/locker/${lockerId}`);
  return { success: true, data: true };
}
