"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, comparePassword } from "@/lib/hash";
import { setSession } from "@/lib/session";

export async function signupUser(data: {
  username: string;
  passwordRaw: string;
}) {
  
  if (data.username.length < 3) {
    return { error: "Нэвтрэх нэр дор хаяж 3 тэмдэгт байх ёстой." };
  }

  const existing = await prisma.user.findFirst({
    where: { username: data.username }
  });

  if (existing) {
    return { error: "Нэвтрэх нэр (Username) давхцаж байна. Өөр нэр сонгоно уу." };
  }

  const hashedPassword = await hashPassword(data.passwordRaw);
  
  const user = await prisma.user.create({
    data: {
      username: data.username,
      passwordHash: hashedPassword,
      isVerified: true // Set to true immediately since there's no email OTP anymore
    }
  });

  // Automatically log them in by creating a session
  await setSession(user.id);

  return { success: true };
}


export async function loginUser(username: string, passwordRaw: string) {
  const user = await prisma.user.findFirst({
    where: { username: username }
  });

  if (!user || !user.passwordHash) {
    return { error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." };
  }

  const isValid = await comparePassword(passwordRaw, user.passwordHash);
  if (!isValid) {
    return { error: "Нэвтрэх нэр эсвэл нууц үг буруу байна." };
  }

  if (user.isBanned) {
    return { error: "Таны эрхийг ёс бус үйлдэл гаргасан тул хаасан байна." };
  }

  await setSession(user.id);
  return { success: true };
}
