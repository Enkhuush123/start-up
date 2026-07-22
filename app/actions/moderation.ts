"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkMessageContent(content: string): Promise<boolean> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not set in Environment Variables!");
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
Та бол чатны аюулгүй байдлыг хянах систем юм. 
Дараах мессежүүд дотор хүнийг хэт доромжилсон үг хэллэг, бэлгийн хүчирхийлэл эсвэл дарамт, мөн хүчээр мөрдөх (stalking) гэмт хэргийн шинж чанартай зүйлс байвал "YES" гэж хариулна уу. 
Анхаарах: Хэрэглэгчид Монгол хэлээр крилл (жишээ нь: сайн уу) эсвэл латин (жишээ нь: sain uu, ymar novshoo hiiged bgan) үсгээр холиж бичих бөгөөд та аль алийг нь ойлгож шинжлэх ёстой.
Хэрвээ энгийн харилцан яриа эсвэл хошигнол төдий, асуудалгүй байвал "NO" гэж хариулна уу. Зөвхөн "YES" эсвэл "NO" гэж хариулна.

Мессеж: "${content}"
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();

    if (text.includes("YES")) {
      return true; // Is bad
    }

    return false; // Is clean
  } catch (error) {
    console.error("Moderation AI Error:", error);
    throw new Error(
      error instanceof Error ? error.message : "Unknown AI Error",
    );
  }
}

export async function applyBan(userId: string) {
  try {
    // 1. Delete all messages associated with the user's matches
    const matches = await prisma.match.findMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });
    const matchIds = matches.map(m => m.id);

    if (matchIds.length > 0) {
      await prisma.message.deleteMany({
        where: { matchId: { in: matchIds } }
      });
    }

    // 2. Delete matches
    if (matchIds.length > 0) {
      await prisma.match.deleteMany({
        where: { id: { in: matchIds } }
      });
    }

    // 3. Delete friendships
    await prisma.friendship.deleteMany({
      where: { OR: [{ user1Id: userId }, { user2Id: userId }] }
    });

    // 4. Finally delete the user account entirely
    await prisma.user.delete({
      where: { id: userId },
    });
  } catch (error) {
    console.error("Failed to ban and delete user:", error);
  }
}
