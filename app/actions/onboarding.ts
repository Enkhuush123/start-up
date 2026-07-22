"use server";

import { prisma } from "@/lib/prisma";

export async function completeOnboarding(
    userId: string,
    data: {
        name: string;
        age: number;
        gender: string;
        height?: number;
        zodiacSign?: string;
        loveLanguage?: string;
        drinking?: string;
        smoking?: string;
        lookingFor?: string;
        interests: string[];
        photos?: string[];
    }
) {
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();

    const updateData: Record<string, unknown> = {
        name: data.name,
        age: data.age,
        gender: data.gender,
        height: data.height,
        zodiacSign: data.zodiacSign,
        loveLanguage: data.loveLanguage,
        drinking: data.drinking,
        smoking: data.smoking,
        lookingFor: data.lookingFor,
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