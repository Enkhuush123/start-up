"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { setSession } from "@/lib/session";


export async function signupUser(data: {
  username: string;
  emailOrPhone: string;
  passwordRaw: string;
}) {
  const isEmail = data.emailOrPhone.includes("@");
  
  
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        { username: data.username },
        { email: isEmail ? data.emailOrPhone : undefined },
        { phone: !isEmail ? data.emailOrPhone : undefined }
      ]
    }
  });

  if (existing) {
    if (existing.username === data.username) return { error: "Нэвтрэх нэр (Username) давхцаж байна." };
    return { error: "Энэ бүртгэл (Утас/Имэйл) аль хэдийн бүртгэлтэй байна." };
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

  
  console.log(`[DEV ONLY] OTP CODE for ${data.emailOrPhone}: ${otpCode}`);

  return { success: true, otpSentTo: data.emailOrPhone, devCode: otpCode };
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

  await setSession(user.id);
  return { success: true };
}


