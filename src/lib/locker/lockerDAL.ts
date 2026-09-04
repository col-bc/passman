import { Item, Locker } from '@/prisma/client';
import { DALResult, EncryptedLocker } from '@/types/server';
import 'server-only';
import { prisma } from '../prisma';

export async function getLockerById(lockerId: string): Promise<DALResult<EncryptedLocker | null>> {
  try {
    const locker = await prisma.locker.findUnique({
      where: { id: lockerId },
      include: {
        lockerItems: {
          include: {
            item: true,
          },
        },
      },
    });
    if (!locker) {
      return { success: false, type: 'NOT_FOUND' };
    }
    return { success: true, data: locker };
  } catch (error) {
    console.warn(`Error fetching locker with ID ${lockerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function getLockersByOwnerId(ownerId: string): Promise<DALResult<EncryptedLocker[]>> {
  try {
    const lockers = await prisma.locker.findMany({
      where: { ownerId },
      include: {
        lockerItems: {
          include: {
            item: true,
            locker: true,
          },
        },
      },
    });
    return { success: true, data: lockers };
  } catch (error) {
    console.warn(`Error fetching lockers for owner ID ${ownerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function createLocker(ownerId: string, title: string): Promise<DALResult<Locker>> {
  const locker = await prisma.locker.create({
    data: { ownerId, title },
  });
  return { success: true, data: locker };
}

export async function updateLocker(
  lockerId: string,
  data: { newTitle?: string; newIcon?: string; newEnableMonitoring?: boolean },
): Promise<DALResult<Locker | null>> {
  const updatedLocker = await prisma.locker.update({
    where: { id: lockerId },
    data: { title: data.newTitle, icon: data.newIcon, enableMonitoring: data.newEnableMonitoring },
  });
  console.log(`Updated locker with ID ${lockerId}:`, updatedLocker);
  if (!updatedLocker) {
    return { success: false, type: 'NOT_FOUND' };
  }
  return { success: true, data: updatedLocker };
}

export async function deleteLocker(lockerId: string): Promise<DALResult<boolean>> {
  const deletedLocker = await prisma.locker.deleteMany({
    where: { id: lockerId },
  });
  if (deletedLocker.count === 0) {
    console.error(`Failed to delete locker ${lockerId}`);
    return { success: false, type: 'NOT_FOUND' };
  }
  return { success: true, data: true };
}

// Locker Item DAL Functions

export async function addLockerItem(lockerId: string, itemId: string): Promise<DALResult<boolean>> {
  const createdItem = await prisma.lockerItems.create({
    data: { lockerId, itemId },
  });
  if (!createdItem) {
    console.error(`Failed to add item ${itemId} to locker ${lockerId}`);
    return { success: false, type: 'SERVER_ERROR' };
  }
  return { success: true, data: true };
}

export async function createLockerItem(
  lockerId: string,
  userId: string,
  item: Omit<Item, 'id' | 'createdAt' | 'updatedAt'>,
): Promise<DALResult<{ lockerId: string; itemId: string }>> {
  try {
    const createdItem = await prisma.item.create({
      data: {
        category: item.category,
        title: item.title,

        iv: Buffer.from(item.iv),
        tag: Buffer.from(item.tag),
        ciphertext: Buffer.from(item.ciphertext),

        ownerId: userId,
        lockerId: lockerId,

        lockerItems: {
          create: {
            lockerId: lockerId,
          },
        },
      },
    });
    if (!createdItem) {
      console.error(`Failed to create item in locker ${lockerId}`);
      return { success: false, type: 'SERVER_ERROR' };
    }
    return { success: true, data: { lockerId: lockerId, itemId: createdItem.id } };
  } catch (error) {
    console.error(`Error creating item in locker ${lockerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function deleteLockerItem(lockerId: string, itemId: string): Promise<DALResult<boolean>> {
  const deletedItem = await prisma.lockerItems.deleteMany({
    where: { lockerId, itemId },
  });
  if (deletedItem.count === 0) {
    console.error(`Failed to remove item ${itemId} from locker ${lockerId}`);
    return { success: false, type: 'NOT_FOUND' };
  }
  return { success: true, data: true };
}

export async function getLockerItem(lockerId: string, itemId: string): Promise<DALResult<Item | null>> {
  try {
    const item = await prisma.item.findUnique({
      where: { id: itemId },
      include: {
        lockerItems: {
          where: { lockerId },
        },
      },
    });
    if (!item) {
      return { success: false, type: 'NOT_FOUND' };
    }
    return { success: true, data: item };
  } catch (error) {
    console.error(`Error fetching item ${itemId} from locker ${lockerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function updateLockerItem(
  lockerId: string,
  itemId: string,
  updates: Partial<Item>,
): Promise<DALResult<{ lockerId: string; itemId: string }>> {
  try {
    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: updates,
    });
    if (!updatedItem) {
      return { success: false, type: 'NOT_FOUND' };
    }
    return { success: true, data: { lockerId: lockerId, itemId: updatedItem.id } };
  } catch (error) {
    console.error(`Error updating item ${itemId} in locker ${lockerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}
