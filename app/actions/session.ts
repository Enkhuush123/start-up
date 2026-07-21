"use server";

import { getSession, clearSession } from "@/lib/session";

export async function checkSession() {
  try {
    return await getSession();
  } catch (error: unknown) {
    console.error("Error in checkSession:", error);
    return null; 
  }
}

export async function logoutUser() {
  await clearSession();
}
