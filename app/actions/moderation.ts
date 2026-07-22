"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";
import { prisma } from "@/lib/prisma";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export async function checkMessageContent(content: string): Promise<boolean> {
  if (!process.env.GEMINI_API_KEY) {
    console.warn("GEMINI_API_KEY is not set. Skipping moderation.");
    return false; // Assuming it's clean if no API key
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
Та бол чатны аюулгүй байдлыг хянах систем юм. 
Дараах мессежүүд дотор хүнийг хэт доромжилсон үг хэллэг, бэлгийн хүчирхийлэл эсвэл дарамт, мөн хүчээр мөрдөх (stalking) гэмт хэргийн шинж чанартай зүйлс байвал "YES" гэж хариулна уу. 
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
    return false; // Fail open
  }
}

export async function applyBan(userId: string) {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { isBanned: true }
    });
  } catch (error) {
    console.error("Failed to ban user:", error);
  }
}
