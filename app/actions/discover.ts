"use server";

import { prisma } from "@/lib/prisma";
import { unstable_noStore as noStore } from "next/cache";

export async function getPotentialMatches(userId: string) {
    noStore();

    const swipedUserIds = await prisma.match.findMany({
        where: { user1Id: userId },
        select: { user2Id: true }
    });

    const excludeIds = swipedUserIds.map(m => m.user2Id);
    excludeIds.push(userId);

    const currentUser = await prisma.user.findUnique({
        where: { id: userId },
        select: { lat: true, lng: true, zodiacSign: true, gender: true, isBlindDateMode: true }
    });

    const targetGender = currentUser?.gender === "Эрэгтэй" ? "Эмэгтэй" : 
                         currentUser?.gender === "Эмэгтэй" ? "Эрэгтэй" : undefined;

    const users = await prisma.user.findMany({
        where: {
            id: { notIn: excludeIds },
            isBlindDateMode: currentUser?.isBlindDateMode || false,
            ...(targetGender ? { gender: targetGender } : {})
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

    const getZodiacScore = (sign1?: string | null, sign2?: string | null) => {
        if (!sign1 || !sign2) return null;
        const sorted = [sign1, sign2].sort();
        let hash = 0;
        const str = sorted.join("-");
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0;
        }
        return 60 + (Math.abs(hash) % 40);
    };

    return users.map(u => ({
        ...u,
        zodiacCompatibility: getZodiacScore(currentUser?.zodiacSign, u.zodiacSign),
        distanceKm: (currentUser?.lat && currentUser?.lng && u.lat && u.lng)
            ? getDistance(currentUser.lat, currentUser.lng, u.lat, u.lng)
            : null
    }));
}

export async function recordSwipe(userId: string, targetUserId: string, isLike: boolean) {
    const status = isLike ? "pending" : "rejected";

    try {
        await prisma.match.upsert({
            where: {
                user1Id_user2Id: {
                    user1Id: userId,
                    user2Id: targetUserId
                }
            },
            update: {
                status: status
            },
            create: {
                user1Id: userId,
                user2Id: targetUserId,
                status: status
            }
        });
    } catch (e) {
        console.error("Swipe record error:", e);
    }


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
            // Update BOTH records to accepted
            await prisma.match.updateMany({
                where: {
                    OR: [
                        { user1Id: userId, user2Id: targetUserId },
                        { user1Id: targetUserId, user2Id: userId }
                    ]
                },
                data: { status: "accepted" }
            });

            // The current user (userId) is seeing the match instantly, so mark their record as seen
            await prisma.match.updateMany({
                where: { user1Id: userId, user2Id: targetUserId },
                data: { user1SawMatch: true }
            });

            // Find canonical match ID
            const isUser1Canonical = userId < targetUserId;
            const canonicalMatch = await prisma.match.findUnique({
                where: {
                    user1Id_user2Id: {
                        user1Id: isUser1Canonical ? userId : targetUserId,
                        user2Id: isUser1Canonical ? targetUserId : userId
                    }
                }
            });

            return { isMatch: true, matchId: canonicalMatch?.id };
        }
    }

    return { isMatch: false };
}