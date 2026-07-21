"use server";

import { prisma } from "@/lib/prisma";

export async function getUserProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  return user;
}

export async function updateUserProfile(userId: string, data: {
    name?: string;
    bio?: string;
    age?: number | null;
    gender?: string;
    interests?: string[];
    photos?: string[];
}) {
  const avatarUrl = data.photos && data.photos.length > 0 ? data.photos[0] : undefined;
  
  const updatedUser = await prisma.user.update({
    where: { id: userId },
    data: {
      ...data,
      ...(avatarUrl ? { avatarUrl } : {})
    },
  });
  return updatedUser;
}

export async function deleteAccount(userId: string) {
  try {
    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });
    const matchIds = matches.map(m => m.id);

    await prisma.message.deleteMany({
      where: { matchId: { in: matchIds } }
    });

    await prisma.message.deleteMany({
      where: { senderId: userId }
    });

    await prisma.match.deleteMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    await prisma.friendship.deleteMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    await prisma.user.delete({
      where: { id: userId }
    });

    return { success: true };
  } catch (err) {
    console.error("Account deletion failed:", err);
    return { success: false };
  }
}
