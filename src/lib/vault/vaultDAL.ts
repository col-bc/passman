import { Vault } from '@/prisma/client';
import { DALResult, VaultWithItems } from '@/types/server';
import 'server-only';
import { prisma } from '../prisma';

export async function getVaultById(vaultId: string): Promise<DALResult<Vault | null>> {
  try {
    const vault = await prisma.vault.findUnique({
      where: { id: vaultId },
      include: {
        vaultItems: {
          include: {
            item: true,
          },
        },
      },
    });
    if (!vault) {
      return { success: false, type: 'NOT_FOUND' };
    }
    return { success: true, data: vault };
  } catch (error) {
    console.warn(`Error fetching vault with ID ${vaultId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function getVaultsByOwnerId(ownerId: string): Promise<DALResult<VaultWithItems[]>> {
  try {
    const vaults = await prisma.vault.findMany({
      where: { ownerId },
      include: {
        vaultItems: {
          include: {
            item: true,
            vault: true,
          },
        },
      },
    });
    return { success: true, data: vaults };
  } catch (error) {
    console.warn(`Error fetching vaults for owner ID ${ownerId}:`, error);
    return { success: false, type: 'SERVER_ERROR' };
  }
}

export async function createVault(ownerId: string, title: string, icon: string = 'default'): Promise<DALResult<Vault>> {
  const vault = await prisma.vault.create({
    data: { ownerId, title, icon },
  });
  return { success: true, data: vault };
}

export async function updateVault(
  vaultId: string,
  data: { newTitle?: string; newIcon?: string },
): Promise<DALResult<Vault | null>> {
  const updatedVault = await prisma.vault.update({
    where: { id: vaultId },
    data: { title: data.newTitle, icon: data.newIcon },
  });
  console.log(`Updated vault with ID ${vaultId}:`, updatedVault);
  if (!updatedVault) {
    return { success: false, type: 'NOT_FOUND' };
  }
  return { success: true, data: updatedVault };
}

export async function deleteVault(vaultId: string): Promise<DALResult<boolean>> {
  const deletedVault = await prisma.vault.deleteMany({
    where: { id: vaultId },
  });
  if (deletedVault.count === 0) {
    console.error(`Failed to delete vault ${vaultId}`);
    return { success: false, type: 'NOT_FOUND' };
  }
  return { success: true, data: true };
}
