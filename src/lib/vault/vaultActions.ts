/**
 * Vault Actions
 *
 * This module contains server actions for managing vaults
 */

'use server';

import { EncryptedData } from '@/lib/crypto';
import { getCurrentUser } from '@/lib/session';
import { SecureItem, Vault } from '@/prisma/client';
import { ActionState, VaultWithItems } from '@/types/server';
import { revalidatePath } from 'next/cache';
import React from 'react';
import { createItem, deleteItem, getItemById, updateItem } from './itemDAL';
import { createVault, getVaultById, getVaultsByOwnerId, updateVault } from './vaultDAL';

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
 * Create a new vault for the current user.
 * @param title The title of the new vault.
 * @returns {Promise<ActionState<Vault>>} The action state containing the newly created encrypted vault.
 */
export async function handleCreateVault(title: string, icon: string = 'default'): Promise<ActionState<Vault>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const result = await createVault(currentUser.id, title, icon);
  if (!result.success) {
    return { success: false, error: 'Failed to create vault', type: 'SERVER_ERROR' };
  }
  revalidatePath('/vaults');
  return { success: true, data: result.data };
}

/**
 * Get all vaults for the current user.
 * @returns {Promise<ActionState<Vault[]>>} The action state containing the list of encrypted vaults.
 */
export async function handleGetVaults(): Promise<ActionState<VaultWithItems[]>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  console.log('[VaultActions] Current user:', currentUser.id);

  const vaults = await getVaultsByOwnerId(currentUser.id);
  console.log('[VaultActions] Fetching vaults for user:', currentUser.id);

  if (vaults.success) {
    return { success: true, data: vaults.data };
  } else {
    if (vaults.type === 'NOT_FOUND') {
      return { success: false, error: 'No record found matching the criteria', type: 'NOT_FOUND' };
    } else if (vaults.type === 'UNAUTHORIZED') {
      return { success: false, error: 'No authorization for this record.', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
}

/**
 * Get a vault by its ID for the current user.
 * @param vaultId The ID of the vault to retrieve.
 * @returns {Promise<ActionState<Vault>>} The action state containing the encrypted vault.
 */
export async function handleGetVaultById(vaultId: string): Promise<ActionState<Vault>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const vault = await getVaultById(vaultId);

  if (vault.success) {
    return { success: true, data: vault.data as Vault };
  }
  if (vault.type === 'NOT_FOUND') {
    return { success: false, error: 'No record found matching the criteria', type: 'NOT_FOUND' };
  } else if (vault.type === 'UNAUTHORIZED') {
    return { success: false, error: 'No authorization for this record.', type: 'UNAUTHORIZED' };
  } else {
    return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
  }
}

/**
 * Rename a vault for the current user.
 * @param vaultId The ID of the vault to rename.
 * @param newTitle The new title for the vault.
 * @returns {Promise<ActionState<Vault>>} The action state containing the updated vault.
 */
export async function handleUpdateVault(
  vaultId: string,
  data: { newTitle?: string; newIcon?: string; enableMonitoring?: boolean },
): Promise<ActionState<Vault>> {
  const currentUser = await getUser();
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const result = await updateVault(vaultId, data);
  if (!result.success) {
    return { success: false, error: 'Failed to update vault', type: 'SERVER_ERROR' };
  }
  revalidatePath(`/vaults/${vaultId}`);
  revalidatePath('/vaults');
  return { success: true, data: result.data as Vault };
}

// Vault Item Actions

/**
 * Create a new secure vault item for the specified vault.
 * @param vaultId The ID of the vault to add the item to.
 * @param encryptedData The encrypted data for the vault item.
 * @param data The metadata for the vault item, including category and title.
 * @returns {Promise<ActionState<{ vaultId: string; itemId: string }>>} The action state containing the vault ID and the newly created item ID.
 */
export async function handleCreateSecureVaultItem(
  vaultId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string },
): Promise<ActionState<{ vaultId: string; itemId: string }>> {
  const status = await getCurrentUser();
  if (!status.success) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const currentUser = status.data;
  if (!currentUser) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }
  const vault = await getVaultById(vaultId);
  if (!vault.success || !vault.data) {
    return { success: false, error: 'Vault not found', type: 'NOT_FOUND' };
  }
  const result = await createItem({
    vaultId: vaultId,
    encryptedData: encryptedData,
    category: data.category,
    title: data.title,
    ownerId: currentUser.id!,
  });

  if (!result.success) {
    return { success: false, error: 'Failed to create vault item', type: 'SERVER_ERROR' };
  }

  revalidatePath(`/vaults/${vaultId}`);
  revalidatePath(`/vaults/${vaultId}/item/${result.data.id}`);
  return { success: true, data: { vaultId: vaultId, itemId: result.data?.id || '' } };
}

/**
 * Get a vault item by its ID for the specified vault.
 * @param vaultId The ID of the vault containing the item.
 * @param itemId The ID of the vault item to retrieve.
 * @returns {Promise<ActionState<SecureVaultItem>>} The action state containing the encrypted vault item.
 */
export async function handleGetVaultItem(vaultId: string, itemId: string): Promise<ActionState<SecureItem>> {
  const status = await getCurrentUser();
  if (!status.success || !status.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const vaultItem = await getItemById(itemId, vaultId);
  if (!vaultItem.success) {
    if (vaultItem.type === 'NOT_FOUND') {
      return { success: false, error: 'Vault item not found', type: 'NOT_FOUND' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  return { success: true, data: vaultItem.data as SecureItem };
}

/**
 * Update a vault item for the specified vault.
 * @param vaultId The ID of the vault containing the item.
 * @param itemId The ID of the vault item to update.
 * @param encryptedData The new encrypted data for the vault item.
 * @param data The new metadata for the vault item, including category and title.
 * @returns {Promise<ActionState<{ vaultId: string; itemId: string }>>} The action state containing the vault ID and the updated item ID.
 */
export async function handleUpdateVaultItem(
  vaultId: string,
  itemId: string,
  encryptedData: EncryptedData,
  data: { category: string; title: string },
): Promise<ActionState<{ vaultId: string; itemId: string }>> {
  const status = await getCurrentUser();
  if (!status.success || !status.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const vault = await getVaultById(vaultId);
  if (!vault.success) {
    if (vault.type === 'NOT_FOUND') {
      return { success: false, error: 'Vault not found', type: 'NOT_FOUND' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  const result = await updateItem(itemId, {
    category: data.category,
    title: data.title,
    encryptedData: encryptedData,
  });

  if (!result.success) {
    if (result.type === 'NOT_FOUND') {
      return { success: false, error: 'Vault item not found', type: 'NOT_FOUND' };
    } else if (result.type === 'UNAUTHORIZED') {
      return { success: false, error: 'User not authorized to update this vault item', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }
  revalidatePath(`/vaults/${vaultId}`);
  revalidatePath(`/vaults/${vaultId}/item/${result.data?.id}`);
  return { success: true, data: { vaultId: vaultId, itemId: result.data?.id || '' } };
}

/**
 * Handle the deletion of a vault item for the specified vault.
 * @param vaultId The ID of the vault containing the item.
 * @param itemId The ID of the vault item to delete.
 * @returns {Promise<ActionState<boolean>>} The action state indicating whether the deletion was successful.
 */
export async function handleDeleteVaultItem(vaultId: string, itemId: string): Promise<ActionState<boolean>> {
  const currentUserStatus = await getCurrentUser();
  if (!currentUserStatus.success || !currentUserStatus.data) {
    return { success: false, error: 'User not authenticated', type: 'UNAUTHORIZED' };
  }

  const status = await deleteItem(itemId);
  if (!status.success) {
    if (status.type === 'NOT_FOUND') {
      return { success: false, error: 'Vault item not found', type: 'NOT_FOUND' };
    } else if (status.type === 'UNAUTHORIZED') {
      return { success: false, error: 'User not authorized to delete this vault item', type: 'UNAUTHORIZED' };
    } else {
      return { success: false, error: 'An unexpected error occurred. Please try again later.', type: 'SERVER_ERROR' };
    }
  }

  revalidatePath(`/vaults/${vaultId}`);
  revalidatePath(`/vaults/${vaultId}/item/${itemId}`);
  return { success: true, data: true };
}
