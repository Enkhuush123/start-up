"use server";

import { prisma } from "@/lib/prisma";

export async function updateLocation(userId: string, lat: number, lng: number) {
    if (!userId) return false;
    
    try {
        await prisma.user.update({
            where: { id: userId },
            data: { lat, lng, lastActive: new Date() }
        });
        return true;
    } catch (e) {
        console.error("Location update failed:", e);
        return false;
    }
}

export async function getMyInviteCode(userId: string) {
    if (!userId) return null;

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { inviteCode: true }
    });

    if (user && !user.inviteCode) {
        
        const code = Math.random().toString(36).substring(2, 7).toUpperCase();
        await prisma.user.update({
            where: { id: userId },
            data: { inviteCode: code }
        });
        return code;
    }

    return user?.inviteCode;
}

export async function addFriendByCode(userId: string, inviteCode: string) {
    if (!userId || !inviteCode) return { success: false, message: "Код оруулна уу" };

    const targetUser = await prisma.user.findUnique({
        where: { inviteCode }
    });

    if (!targetUser) {
        return { success: false, message: "Урилгын код буруу байна" };
    }

    if (targetUser.id === userId) {
        return { success: false, message: "Өөрийгөө нэмэх боломжгүй" };
    }

    
    const existing = await prisma.friendship.findFirst({
        where: {
            OR: [
                { user1Id: userId, user2Id: targetUser.id },
                { user1Id: targetUser.id, user2Id: userId }
            ]
        }
    });

    if (existing) {
        if (existing.status === "accepted") {
            return { success: false, message: "Та хоёр аль хэдийн найзууд байна" };
        } else if (existing.status === "pending" && existing.user2Id === userId) {
            
            await prisma.friendship.update({
                where: { id: existing.id },
                data: { status: "accepted" }
            });
            return { success: true, message: "Найзууд боллоо!" };
        } else {
            return { success: false, message: "Хүсэлт аль хэдийн илгээгдсэн байна" };
        }
    }

    
    await prisma.friendship.create({
        data: {
            user1Id: userId,
            user2Id: targetUser.id,
            status: "pending"
        }
    });

    return { success: true, message: "Найз болох хүсэлт илгээгдлээ!" };
}

export async function getPendingRequests(userId: string) {
    if (!userId) return [];
    
    
    const requests = await prisma.friendship.findMany({
        where: {
            user2Id: userId,
            status: "pending"
        },
        include: {
            user1: { select: { id: true, name: true, photos: true, avatarUrl: true } }
        }
    });

    return requests.map(r => ({
        id: r.id, 
        userId: r.user1.id,
        name: r.user1.name,
        image: r.user1.photos?.length > 0 ? r.user1.photos[0] : r.user1.avatarUrl
    }));
}

export async function getPendingRequestCount(userId: string) {
    if (!userId) return 0;
    const count = await prisma.friendship.count({
        where: {
            user2Id: userId,
            status: "pending"
        }
    });
    return count;
}

export async function acceptRequest(friendshipId: string) {
    try {
        await prisma.friendship.update({
            where: { id: friendshipId },
            data: { status: "accepted" }
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function rejectRequest(friendshipId: string) {
    try {
        await prisma.friendship.delete({
            where: { id: friendshipId }
        });
        return { success: true };
    } catch (e) {
        return { success: false };
    }
}

export async function getMapFriends(userId: string) {
    if (!userId) return [];

    const friendships = await prisma.friendship.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ],
            status: "accepted"
        },
        include: {
            user1: { select: { id: true, name: true, lat: true, lng: true, photos: true, avatarUrl: true, lastActive: true } },
            user2: { select: { id: true, name: true, lat: true, lng: true, photos: true, avatarUrl: true, lastActive: true } }
        }
    });

    const friends = friendships.map(f => {
        const friend = f.user1Id === userId ? f.user2 : f.user1;
        
        if (friend.lat && friend.lng) {
            return {
                id: friend.id,
                name: friend.name,
                lat: friend.lat,
                lng: friend.lng,
                image: friend.photos?.length > 0 ? friend.photos[0] : friend.avatarUrl,
                lastActive: friend.lastActive
            };
        }
        return null;
    }).filter(Boolean);

    return friends;
}
