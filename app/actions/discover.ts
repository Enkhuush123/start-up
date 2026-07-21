"use server";

import { prisma } from "@/lib/prisma";

export async function getPotentialMatches(userId: string) {

    const swipedUserIds = await prisma.match.findMany({
        where: { user1Id: userId },
        select: { user2Id: true }
    });

    const excludeIds = swipedUserIds.map(m => m.user2Id);
    excludeIds.push(userId);

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lat: true, lng: true }
    });

    const users = await prisma.user.findMany({
        where: {
            id: { notIn: excludeIds }
        },
        take: 10
    });

    const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371;
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return Math.round(R * c);
    };

    return users.map(u => ({
        ...u,
        distanceKm: (currentUser?.lat && currentUser?.lng && u.lat && u.lng)
            ? getDistance(currentUser.lat, currentUser.lng, u.lat, u.lng)
            : null
    }));
}

export async function recordSwipe(userId: string, targetUserId: string, isLike: boolean) {
    const status = isLike ? "pending" : "rejected";

    await prisma.match.create({
        data: {
            user1Id: userId,
            user2Id: targetUserId,
            status: status
        }
    });


    if (isLike) {
        const mutual = await prisma.match.findUnique({
            where: {
                user1Id_user2Id: {
                    user1Id: targetUserId,
                    user2Id: userId
                }
            }
        });

        if (mutual && mutual.status === "pending") {
            await prisma.match.updateMany({
                where: {
                    OR: [
                        { user1Id: userId, user2Id: targetUserId },
                        { user1Id: targetUserId, user2Id: userId }
                    ]
                },
                data: { status: "accepted" }
            });
            return { isMatch: true };
        }
    }

    return { isMatch: false };
}