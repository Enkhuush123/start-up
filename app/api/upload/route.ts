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

    
    const originalName = file.name || "upload.jpg";
    const extension = originalName.split('.').pop();
    const filename = `${randomUUID()}.${extension}`;

    
    const uploadDir = join(process.cwd(), "public", "uploads");
    const filepath = join(uploadDir, filename);

    await writeFile(filepath, buffer);

    return NextResponse.json({ success: true, url: `/uploads/${filename}` });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: "Internal Server Error" }, { status: 500 });
  }
}
