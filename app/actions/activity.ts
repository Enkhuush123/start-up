"use server";

import { prisma } from "@/lib/prisma";
import { checkSession } from "@/app/actions/session";

export async function pingActive() {
    const session = await checkSession();
    if (!session?.userId) return { success: false };

    try {
        await prisma.user.update({
            where: { id: session.userId },
            data: { lastActive: new Date() }
        });
        return { success: true };
    } catch (e) {
        console.error("Failed to update lastActive:", e);
        return { success: false };
    }
}
