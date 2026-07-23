"use server";

import { prisma } from "@/lib/prisma";

import { getSession, clearSession } from "@/lib/session";

export async function checkSession() {
  try {
    const session = await getSession();
    if (!session || !session.userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: { name: true, gender: true, age: true, photos: true }
    });

    if (!user) return null;

    const onboardingComplete = !!(user.name && user.gender && user.age && user.photos && user.photos.length > 0);

    return { ...session, onboardingComplete };
  } catch (error: unknown) {
    console.error("Error in checkSession:", error);
    return null; 
  }
}

export async function logoutUser() {
  await clearSession();
}
