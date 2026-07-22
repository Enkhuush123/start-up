import { GoogleGenerativeAI } from "@google/generative-ai";
import * as dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

async function test() {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const msgs = ["zail muu gulug mn", "alna shuu cmg", "sain uu"];

  for (const content of msgs) {
    const prompt = `
Та бол чатны аюулгүй байдлыг хянах систем юм. 
Дараах мессежүүд дотор хүнийг хэт доромжилсон үг хэллэг, бэлгийн хүчирхийлэл эсвэл дарамт, мөн хүчээр мөрдөх (stalking) гэмт хэргийн шинж чанартай зүйлс байвал "YES" гэж хариулна уу. 
Анхаарах: Хэрэглэгчид Монгол хэлээр крилл (жишээ нь: сайн уу) эсвэл латин (жишээ нь: sain uu, ymar novshoo hiiged bgan) үсгээр холиж бичих бөгөөд та аль алийг нь ойлгож шинжлэх ёстой.
Хэрвээ энгийн харилцан яриа эсвэл хошигнол төдий, асуудалгүй байвал "NO" гэж хариулна уу. Зөвхөн "YES" эсвэл "NO" гэж хариулна.

Мессеж: "${content}"
`;

    try {
      const result = await model.generateContent(prompt);
      const response = await result.response;
      console.log(`Msg: "${content}" -> AI: ${response.text().trim()}`);
    } catch (e) {
      console.error(e);
    }
  }
}

test();
