import { Login } from "@/prisma/client";
import { DALResult } from "@/types/server";
import { prisma } from "./prisma";

export async function recordLogin(
    loginData: Omit<Login, "id" | "createdAt">,
): Promise<DALResult<Login>> {
    try {
        const newLogin = await prisma.login.create({
            data: { ...loginData },
        });
        return { success: true, data: newLogin };
    } catch (error) {
        console.error("Error recording login:", error);
        return { success: false, type: "SERVER_ERROR" };
    }
}

export async function getLoginsByUserId(
    userId: string,
): Promise<DALResult<Login[]>> {
    try {
        const logins = await prisma.login.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        });
        return { success: true, data: logins };
    } catch (error) {
        console.error("Error fetching logins:", error);
        return { success: false, type: "SERVER_ERROR" };
    }
}
