"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { setSession } from "@/lib/session";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

export async function signupUser(data: {
  username: string;
  emailOrPhone: string;
  passwordRaw: string;
}) {
  const isEmail = data.emailOrPhone.includes("@");
  
  if (!isEmail) {
    return { error: "Зөвхөн Имэйл хаягаар бүртгүүлэх боломжтой." };
  }
  
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: data.emailOrPhone }
      ]
    }
  });

  if (existing) {
    if (existing.username === data.username) return { error: "Нэвтрэх нэр (Username) давхцаж байна." };
    return { error: "Энэ Имэйл хаяг аль хэдийн бүртгэлтэй байна." };
  }

  const hashedPassword = await hashPassword(data.passwordRaw);
  
  const user = await prisma.user.create({
    data: {
      username: data.username,
      email: isEmail ? data.emailOrPhone : null,
      phone: !isEmail ? data.emailOrPhone : null,
      passwordHash: hashedPassword,
      isVerified: false
    }
  });

  
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
  
  await prisma.verificationToken.create({
    data: {
      identifier: data.emailOrPhone,
      code: otpCode,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) 
    }
  });

  try {
    const info = await transporter.sendMail({
      from: `"Rizz" <${process.env.GMAIL_USER}>`,
      to: data.emailOrPhone,
      subject: "Rizz баталгаажуулах код",
      html: `
        <div style="font-family: sans-serif; text-align: center; padding: 20px;">
          <h2>Rizz-д тавтай морилно уу!</h2>
          <p>Таны баталгаажуулах код доор байна:</p>
          <div style="font-size: 32px; font-weight: bold; letter-spacing: 5px; padding: 20px; background: #f4f4f5; border-radius: 10px; margin: 20px 0;">
            ${otpCode}
          </div>
          <p style="color: #666; font-size: 12px;">Энэхүү код 10 минутын дараа дуусна.</p>
        </div>
      `
    });

  } catch (error) {
    console.error("Failed to send email with nodemailer:", error);
    return { error: "Имэйл илгээхэд алдаа гарлаа: " + (error instanceof Error ? error.message : "Мэдэгдэхгүй алдаа") };
  }

  return { success: true, otpSentTo: data.emailOrPhone };
}


export async function verifyOtpAndLogin(identifier: string, code: string) {
  const token = await prisma.verificationToken.findFirst({
    where: {
      identifier,
      code,
      expiresAt: { gt: new Date() }
    }
  });

  if (!token) return { error: "Код буруу эсвэл хугацаа нь дууссан байна." };

  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!user) return { error: "Хэрэглэгч олдсонгүй." };

  await prisma.user.update({
    where: { id: user.id },
    data: { isVerified: true }
  });

  await prisma.verificationToken.delete({ where: { id: token.id } });

  await setSession(user.id);
  
  return { success: true };
}


export async function loginUser(identifier: string, passwordRaw: string) {
  const user = await prisma.user.findFirst({
    where: {
      OR: [
        { username: identifier },
        { email: identifier },
        { phone: identifier }
      ]
    }
  });

  if (!user || !user.passwordHash) {
    return { error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." };
  }

  const isValid = await comparePassword(passwordRaw, user.passwordHash);
  if (!isValid) {
    return { error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." };
  }

  if (!user.isVerified) {
    return { error: "Бүртгэлээ баталгаажуулаагүй байна." };
  }

  if (user.isBanned) {
    return { error: "Таны эрхийг ёс бус үйлдэл гаргасан тул хаасан байна." };
  }

  await setSession(user.id);
  return { success: true };
}


