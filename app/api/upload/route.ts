import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import { join } from "path";
import { randomUUID } from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Convert file to base64 Data URI instead of saving to local disk
    // This allows photo uploads to work on Vercel without S3/Blob storage
    const mimeType = file.type || "image/jpeg";
    const base64String = buffer.toString("base64");
    const dataUri = `data:${mimeType};base64,${base64String}`;

    return NextResponse.json({ success: true, url: dataUri });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
