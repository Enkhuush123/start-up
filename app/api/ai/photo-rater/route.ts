import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

export async function POST(req: Request) {
  try {
    const { imageUrl } = await req.json();

    if (!imageUrl) {
      return NextResponse.json(
        { error: "No image URL provided" },
        { status: 400 },
      );
    }

    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString("base64");
    const mimeType = imageResp.headers.get("content-type") || "image/jpeg";

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

    const prompt = `
    Чи бол Dating апп-ийн профайл зургийн мэргэжлийн зөвлөх.
    Энэхүү зургийг хараад, тухайн хүн Dating апп дээр хэр олон Match авах магадлалтайг 1-100 хүртэл оноогоор дүгнээд, 
    яагаад ийм оноо өгснөө болон яаж сайжруулж болохыг маш найрсаг, эерэгээр (Монгол хэлээр) зөвлөнө үү.
    
    Хариуг зөвхөн дараах JSON форматаар буцаана:
    {
      "score": 85,
      "feedback": "Таны инээмсэглэл маш сайхан гарсан байна, гэхдээ гэрэлтүүлгээ жоохон нэмбэл илүү олон хүнд таалагдана."
    }
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: mimeType,
        },
      },
    ]);

    let responseText = result.response.text().trim();
    if (responseText.startsWith("\`\`\`json")) {
      responseText = responseText
        .replace(/\`\`\`json/g, "")
        .replace(/\`\`\`/g, "")
        .trim();
    }

    const parsed = JSON.parse(responseText);

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Photo Rater Error:", error);
    return NextResponse.json({ error: "Алдаа гарлаа" }, { status: 500 });
  }
}
