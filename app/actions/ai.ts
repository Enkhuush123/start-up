"use server";

import { prisma } from "@/lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

const LOVE_FACTS = [
  "Хүмүүс бие биенийхээ нүд рүү 3 минут ширтэхэд зүрхний цохилт нь ижил хэмнэлтэй болдог.",
  "Тэврэлт нь өвчин намдаах үйлчилгээтэй Окситоцин дааврыг ялгаруулдаг.",
  "Романтик хайр нь тархинд кокаин хэрэглэсэн үеийнхтэй ижил нөлөө үзүүлдэг.",
  "Хүн дурласан үедээ хоолны дуршил болон нойроо алддаг.",
  "Хамтдаа шинэ зүйл турших нь харилцааг хамгийн ихээр бат бөх болгодог.",
  "Анхны харцаар дурлахад ердөө 0.2 секунд хангалттай.",
  "Хосууд хамтдаа инээх үед тэдний харилцаа илүү удаан үргэлжилдэг.",
  "Гар гараасаа хөтлөх үед хүний стресс болон айдас буурдаг.",
  "Таныг үнэхээр хайрладаг хүн таны өө сэвийг ч төгс гэж хардаг.",
  "Эртний Грекчүүд хайрыг 8 өөр төрөлд хувааж үздэг байсан.",
];

export async function getLoveFact() {
  const randomFact = LOVE_FACTS[Math.floor(Math.random() * LOVE_FACTS.length)];
  return randomFact;
}

export async function evaluateChat(matchId: string) {
  try {
    const messages = await prisma.message.findMany({
      where: { matchId },
      orderBy: { createdAt: "desc" },
      take: 15,
      include: {
        sender: { select: { name: true } },
      },
    });

    if (messages.length < 3) {
      return { emoji: "😶", description: "Чат эхлээгүй байна" };
    }

    const conversation = messages
      .reverse()
      .map((m) => `${m.sender.name}: ${m.content}`)
      .join("\n");

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    Энэхүү харилцан яриаг уншаад хосуудын харилцаа ямархуу байгааг 1 ширхэг EMOJI-гоор дүгнэнэ үү.
    Зөвхөн 1 emoji буцаана.
    Маш сайн, дурласан: 🤩 эсвэл 😍
    Сайн, хэвийн: 😊 эсвэл 😄
    Уйтгартай, хөндий: 😐 эсвэл 🥱
    Ууртай, муудалцсан: 😡 эсвэл 😠
    
    Яриа:
    ${conversation}
    `;

    const result = await model.generateContent(prompt);
    const emoji = result.response.text().trim().substring(0, 2);

    return { emoji };
  } catch (error) {
    console.error("Chat eval error:", error);
    return { emoji: "🤔", description: "Алдаа гарлаа" };
  }
}

export async function suggestDateIdeas(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: {
            name: true,
            interests: true,
            lookingFor: true,
            loveLanguage: true,
          },
        },
        user2: {
          select: {
            name: true,
            interests: true,
            lookingFor: true,
            loveLanguage: true,
          },
        },
      },
    });

    if (!match) return { error: "Match found not." };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    Чи бол Cupid AI, хосуудад зориулсан шилдэг болзооны газруудыг санал болгодог туслах.
    Хоёр хүний мэдээлэл:
    Хүн 1: ${match.user1.name}, сонирхол: ${match.user1.interests.join(", ")}, Хайрын хэл: ${match.user1.loveLanguage}, Хайж буй: ${match.user1.lookingFor}
    Хүн 2: ${match.user2.name}, сонирхол: ${match.user2.interests.join(", ")}, Хайрын хэл: ${match.user2.loveLanguage}, Хайж буй: ${match.user2.lookingFor}

    Дээрх хоёр хүний нийтлэг сонирхол болон онцлогт нь тааруулан 3 ширхэг гоё, тухтай болзох газар болон санааг Монгол хэлээр санал болго. 
    Маш романтик бөгөөд бүтээлч байх хэрэгтэй.
    Формат: Markdown ашиглаж жагсаалтаар товч бөгөөд тодорхой бич.
    `;

    const result = await model.generateContent(prompt);
    const ideas = result.response.text();

    return { ideas };
  } catch (error) {
    console.error("Suggest date error:", error);
    return { error: "Алдаа гарлаа." };
  }
}

export async function suggestIcebreaker(matchId: string) {
  try {
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        user1: {
          select: { name: true, interests: true, zodiacSign: true, bio: true },
        },
        user2: {
          select: { name: true, interests: true, zodiacSign: true, bio: true },
        },
      },
    });

    if (!match) return { error: "Match not found." };

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    Чи бол Cupid AI, хосуудад зориулсан хөгжилтэй, сонирхол татам эхний мессеж (icebreaker) санал болгодог туслах.
    Хоёр хүний мэдээлэл:
    Хүн 1: ${match.user1.name}, сонирхол: ${match.user1.interests.join(", ")}, Орд: ${match.user1.zodiacSign}, Био: ${match.user1.bio}
    Хүн 2: ${match.user2.name}, сонирхол: ${match.user2.interests.join(", ")}, Орд: ${match.user2.zodiacSign}, Био: ${match.user2.bio}

    Энэ хоёр хүний сонирхол, орд, эсвэл био-г нь уншаад маш хөгжилтэй, ухаалаг эсвэл догь 3 өөр ЭХНИЙ МЕССЕЖ-ийг (Монгол хэлээр) санал болго. 
    Маш богинохон бөгөөд хөгжилтэй байх хэрэгтэй.
    Формат: Зөвхөн 1, 2, 3 гэж дугаарласан текст буцаана.
    `;

    const result = await model.generateContent(prompt);
    const icebreakers = result.response.text();

    return { icebreakers };
  } catch (error) {
    console.error("Suggest icebreaker error:", error);
    return { error: "Алдаа гарлаа." };
  }
}

export async function getHighCompatibilityMatches(userId: string) {
  try {
    const me = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!me) return [];

    // Find other users
    const others = await prisma.user.findMany({
      where: {
        id: { not: userId },
        isBanned: false,
      },
      select: {
        id: true,
        name: true,
        age: true,
        avatarUrl: true,
        photos: true,
        gender: true,
        zodiacSign: true,
        loveLanguage: true,
        lookingFor: true,
        drinking: true,
        smoking: true,
        interests: true,
      },
    });

    const matches = others.map((other) => {
      let score = 0;
      let totalFields = 0;

      // Interests match
      if (me.interests.length > 0 && other.interests.length > 0) {
        totalFields += 3; // Weight interests higher
        const common = me.interests.filter((i) => other.interests.includes(i));
        score +=
          (common.length /
            Math.max(me.interests.length, other.interests.length)) *
          3;
      }

      if (me.lookingFor && other.lookingFor) {
        totalFields += 2;
        if (me.lookingFor === other.lookingFor) score += 2;
      }

      if (me.loveLanguage && other.loveLanguage) {
        totalFields += 1;
        if (me.loveLanguage === other.loveLanguage) score += 1;
      }

      if (me.drinking && other.drinking) {
        totalFields += 1;
        if (me.drinking === other.drinking) score += 1;
      }

      if (me.smoking && other.smoking) {
        totalFields += 1;
        if (me.smoking === other.smoking) score += 1;
      }

      // Zodiac logic (simple match for demo, normally complex)
      if (me.zodiacSign && other.zodiacSign) {
        totalFields += 1;
        score += 0.5; // Neutral baseline for astrology
      }

      const matchPercentage =
        totalFields === 0 ? 0 : Math.round((score / totalFields) * 100);

      return {
        ...other,
        matchPercentage,
      };
    });

    // Return only those >= 80% (or top matched if none >= 80% to avoid empty state)
    let topMatches = matches
      .filter((m) => m.matchPercentage >= 75)
      .sort((a, b) => b.matchPercentage - a.matchPercentage);

    if (topMatches.length === 0) {
      // Fallback: Just return highest if strictly 80% is too hard
      topMatches = matches
        .sort((a, b) => b.matchPercentage - a.matchPercentage)
        .slice(0, 5);
    }

    return topMatches;
  } catch (error) {
    console.error("Match error:", error);
    return [];
  }
}
