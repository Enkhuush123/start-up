"use server";

import { prisma } from "@/lib/prisma";
import { checkMessageContent, applyBan } from "./moderation";
import { sendPushNotification } from "@/app/actions/push";

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
            user1: { select: { id: true, name: true, photos: true, lastActive: true, avatarUrl: true, isBlindDateMode: true } },
            user2: { select: { id: true, name: true, photos: true, lastActive: true, avatarUrl: true, isBlindDateMode: true } },
            messages: {
                orderBy: { createdAt: "desc" },
                take: 1
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    // Deduplicate matches (mutual swipes create 2 rows in Match table)
    const seen = new Set();
    const dedupedMatches = [];

    for (const match of matches) {
        const isUser1 = match.user1Id === userId;
        const otherUser = isUser1 ? match.user2 : match.user1;

        if (seen.has(otherUser.id)) continue;
        seen.add(otherUser.id);

        // Find the canonical match row (where user1Id < user2Id) to ensure both users use the SAME matchId for messages
        const canonicalMatch = matches.find(m => 
            (m.user1Id === userId && m.user2Id === otherUser.id && m.user1Id < m.user2Id) ||
            (m.user1Id === otherUser.id && m.user2Id === userId && m.user1Id < m.user2Id)
        ) || match;

        const lastMessage = canonicalMatch.messages.length > 0 ? canonicalMatch.messages[0] : null;

        dedupedMatches.push({
            id: canonicalMatch.id,
            createdAt: canonicalMatch.createdAt,
            otherUser,
            currentUser: isUser1 ? match.user1 : match.user2,
            lastMessage
        });
    }

    return dedupedMatches;
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
    
    // AI Moderation Check
    try {
        const isBad = await checkMessageContent(content);
        if (isBad) {
            await applyBan(senderId);
            return { error: "Ёс бус мессеж илгээсэн тул таны эрхийг хаалаа." };
        }
    } catch (e) {
        return { error: "AI Moderation Error: " + (e instanceof Error ? e.message : "Unknown error") };
    }
    
    const message = await prisma.message.create({
        data: {
            matchId,
            senderId,
            content
        },
        include: {
            match: {
                select: {
                    user1Id: true,
                    user2Id: true
                }
            },
            sender: {
                select: {
                    name: true,
                    username: true
                }
            }
        }
    });

    // Send push notification asynchronously
    const otherUserId = message.match.user1Id === senderId ? message.match.user2Id : message.match.user1Id;
    const senderName = message.sender.name || message.sender.username || "Нэргүй хэрэглэгч";
    
    sendPushNotification(
        otherUserId, 
        `${senderName} танд мессеж илгээлээ`, 
        content,
        `/chat`
    ).catch(e => console.error("Failed to send push:", e));

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
