"use server";

import { prisma } from "@/lib/prisma";
import { checkSession } from "@/app/actions/session";

export async function getUnseenMatch() {
    const session = await checkSession();
    if (!session?.userId) return null;
    
    const userId = session.userId;

    // Find the record where the current user swiped (user1Id) and hasn't seen the accepted match
    const match = await prisma.match.findFirst({
        where: {
            user1Id: userId,
            status: "accepted",
            user1SawMatch: false
        },
        include: {
            user1: {
                select: { id: true, name: true, photos: true, avatarUrl: true }
            },
            user2: {
                select: { id: true, name: true, photos: true, avatarUrl: true }
            }
        }
    });

    if (!match) return null;

    // The matched user is always user2 since we are user1
    const matchedUser = match.user2;

    // Get current user's photo for the MatchScreen
    const currentUser = match.user1;
    const currentUserPhoto = currentUser.photos?.[0] || currentUser.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000";

    return {
        matchId: match.id,
        matchedUser,
        currentUserPhoto
    };
}

export async function markMatchAsSeen(matchId: string) {
    const session = await checkSession();
    if (!session?.userId) return { success: false };

    const userId = session.userId;

    const match = await prisma.match.findUnique({
        where: { id: matchId }
    });

    if (!match) return { success: false };

    // We only update the record where the current user is user1
    if (match.user1Id === userId) {
        await prisma.match.update({
            where: { id: matchId },
            data: { user1SawMatch: true }
        });
    }

    return { success: true };
}
