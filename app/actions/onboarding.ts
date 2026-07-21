"use server";

import { prisma } from "@/lib/prisma";

export async function completeOnboarding(
    userId: string,
    data: {
        name: string;
        age: number;
        gender: string;
        interests: string[];
        photos?: string[];
    }
) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const updateData: Record<string, unknown> = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        interests: data.interests,
        inviteCode: inviteCode,
    };

    if (data.photos && data.photos.length > 0) {
        updateData.photos = data.photos;
    }

    await prisma.user.update({
        where: { id: userId },
        data: updateData
    });

    return { success: true };
}