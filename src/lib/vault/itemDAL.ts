import { SecureItem } from '@/prisma/client';
import { DALResult } from '@/types/server';
import 'server-only';
import { EncryptedData } from '../crypto';
import { prisma } from '../prisma';
import { getUserById } from '../user/userDAL';

export async function getItemsByVaultId(vaultId: string, userId: string): Promise<DALResult<SecureItem[]>> {
  try {
    const items = await prisma.secureItem.findMany({
      where: {
        vaultItems: {
          some: {
            vaultId: vaultId,
            vault: { ownerId: userId },
          },
        },
      },
    });
    return { success: true, data: items };
  } catch (error) {
    console.error(`Error fetching items for vault ${vaultId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function getItemById(
  itemId: string,
  vaultId: string,
  userId: string,
): Promise<DALResult<SecureItem | null>> {
  try {
    const item = await prisma.secureItem.findFirst({
      where: {
        id: itemId,
        vaultItems: {
          some: {
            vaultId: vaultId,
            vault: { ownerId: userId },
          },
        },
      },
    });

    if (!item) {
      return { success: false, type: 'NOT_FOUND' };
    }
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error fetching item ${itemId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function createItem({
  vaultId,
  title,
  category,
  encryptedData,
  ownerId,
}: {
  vaultId: string;
  title: string;
  category: string;
  encryptedData: EncryptedData;
  ownerId: string;
}): Promise<DALResult<SecureItem>> {
  const user = await getUserById(ownerId);
  if (!user.success || !user.data) {
    console.error(`User with ID ${ownerId} not found.`);
    return { success: false, type: 'NOT_FOUND' };
  }

  try {
    const encodedCiphertext = Buffer.from(encryptedData.ciphertext).toString('base64');
    const encodedIv = Buffer.from(encryptedData.iv).toString('base64');
    const encodedTag = Buffer.from(encryptedData.tag).toString('base64');
    const item = await prisma.secureItem.create({
      data: {
        title,
        category,
        ciphertext: encodedCiphertext,
        iv: encodedIv,
        tag: encodedTag,
        vaultItems: {
          create: {
            vault: {
              connect: { id: vaultId },
            },
          },
        },
      },
    });
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error creating item in vault ${vaultId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function updateItem(
  itemId: string,
  updatedFields: Partial<{
    title: string;
    category: string;
    encryptedData: EncryptedData;
  }>,
): Promise<DALResult<SecureItem | null>> {
  try {
    const updateData: Partial<SecureItem> = { ...updatedFields };
    if (updatedFields.encryptedData) {
      const { ciphertext, iv, tag } = updatedFields.encryptedData;
      updateData.ciphertext = Buffer.from(ciphertext).toString('base64');
      updateData.iv = Buffer.from(iv).toString('base64');
      updateData.tag = Buffer.from(tag).toString('base64');
    }
    const item = await prisma.secureItem.update({
      where: { id: itemId },
      data: {
        title: updateData.title,
        category: updateData.category,
        ciphertext: updateData.ciphertext,
        iv: updateData.iv,
        tag: updateData.tag,
      },
    });
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error updating item ${itemId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function deleteItem(itemId: string): Promise<DALResult<boolean>> {
  try {
    await prisma.secureItem.delete({
      where: { id: itemId },
    });
    return { success: true, data: true };
  } catch (error) {
    console.error(`Error deleting item ${itemId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}
