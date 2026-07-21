"use server";

import { prisma } from "@/lib/prisma";

export async function getMatches(userId: string) {
    const matches = await prisma.match.findMany({
        where: {
            OR: [
                { user1Id: userId },
                { user2Id: userId }
            ],
            status: "accepted"
        },
        include: {
            user1: { select: { id: true, name: true, photos: true, lastActive: true, avatarUrl: true } },
            user2: { select: { id: true, name: true, photos: true, lastActive: true, avatarUrl: true } },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    
    return matches.map(match => {
        const isUser1 = match.user1Id === userId;
        const otherUser = isUser1 ? match.user2 : match.user1;
        const lastMessage = match.messages.length > 0 ? match.messages[0] : null;

        return {
            id: match.id,
            createdAt: match.createdAt,
            otherUser,
            lastMessage
        };
    });
}

export async function getMessages(matchId: string, userId: string) {
    const messages = await prisma.message.findMany({
        where: { matchId },
        orderBy: { createdAt: "asc" }
    });

    
    await prisma.message.updateMany({
        where: {
            matchId,
            senderId: { not: userId },
            isRead: false
        },
        data: { isRead: true }
    });

    return messages;
}

export async function sendMessage(matchId: string, senderId: string, content: string) {
    if (!content.trim()) return null;
    
    const message = await prisma.message.create({
        data: {
            matchId,
            senderId,
            content
        }
    });
    return message;
}

export async function getUnreadMessageCount(userId: string) {
    if (!userId) return 0;
    
    const count = await prisma.message.count({
        where: {
            match: {
                OR: [
                    { user1Id: userId },
                    { user2Id: userId }
                ]
            },
            senderId: { not: userId },
            isRead: false
        }
    });

    return count;
}
