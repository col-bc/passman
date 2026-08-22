import { Item } from "@/prisma/client";
import { DALResult } from "@/types/server";
import "server-only";
import { EncryptedData } from "./crypto";
import { prisma } from "./prisma";
import { getUserById } from "./userDAL";

export async function getItemsByLockerId(
    lockerId: string,
): Promise<DALResult<Item[]>> {
    try {
        const items = await prisma.item.findMany({
            where: { lockerId },
        });
        return { success: true, data: items };
    } catch (error) {
        console.error(`Error fetching items for locker ${lockerId}:`, error);
        return { success: false, type: "SERVER_ERROR" };
    }
}

export async function getItemById(
    itemId: string,
): Promise<DALResult<Item | null>> {
    try {
        const item = await prisma.item.findUnique({
            where: { id: itemId },
        });
        if (!item) {
            return { success: false, type: "NOT_FOUND" };
        }
        return { success: true, data: item };
    } catch (error) {
        console.error(`Error fetching item ${itemId}:`, error);
        return { success: false, type: "SERVER_ERROR" };
    }
}

export async function createItem({
    lockerId,
    title,
    category,
    encryptedData,
    ownerId,
}: {
    lockerId: string;
    title: string;
    category: string;
    encryptedData: EncryptedData;
    ownerId: string;
}): Promise<DALResult<Item>> {
    const user = await getUserById(ownerId);
    if (!user.success || !user.data) {
        console.error(`User with ID ${ownerId} not found.`);
        return { success: false, type: "NOT_FOUND" };
    }

    try {
        const encodedCiphertext = Buffer.from(
            encryptedData.ciphertext,
        ).toString("base64");
        const encodedIv = Buffer.from(encryptedData.iv).toString("base64");
        const encodedTag = Buffer.from(encryptedData.tag).toString("base64");

        const item = await prisma.item.create({
            data: {
                lockerId,
                title,
                category,
                ownerId,
                ciphertext: Buffer.from(encodedCiphertext),
                iv: Buffer.from(encodedIv),
                tag: Buffer.from(encodedTag),
                user: { connect: { id: ownerId } },
            },
        });
        return { success: true, data: item };
    } catch (error) {
        console.error(`Error creating item in locker ${lockerId}:`, error);
        return { success: false, type: "SERVER_ERROR" };
    }
}

export async function updateItem(
    itemId: string,
    updatedFields: Partial<{
        title: string;
        category: string;
        encryptedData: EncryptedData;
    }>,
): Promise<DALResult<Item | null>> {
    try {
        const updateData: Partial<Item> = { ...updatedFields };
        if (updatedFields.encryptedData) {
            const { ciphertext, iv, tag } = updatedFields.encryptedData;
            updateData.ciphertext = Buffer.from(
                Buffer.from(ciphertext).toString("base64"),
            );
            updateData.iv = Buffer.from(Buffer.from(iv).toString("base64"));
            updateData.tag = Buffer.from(Buffer.from(tag).toString("base64"));
        }
        const item = await prisma.item.update({
            where: { id: itemId },
            data: updateData,
        });
        return { success: true, data: item };
    } catch (error) {
        console.error(`Error updating item ${itemId}:`, error);
        return { success: false, type: "SERVER_ERROR" };
    }
}

export async function deleteItem(itemId: string): Promise<DALResult<boolean>> {
    try {
        await prisma.item.delete({
            where: { id: itemId },
        });
        return { success: true, data: true };
    } catch (error) {
        console.error(`Error deleting item ${itemId}:`, error);
        return { success: false, type: "SERVER_ERROR" };
    }
}
