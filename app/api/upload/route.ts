import { NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: Request) {
  try {
    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const base64String = buffer.toString("base64");
    const mimeType = file.type || "image/jpeg";
    const dataUri = `data:${mimeType};base64,${base64String}`;

    // Upload to Cloudinary
    const uploadResponse = await cloudinary.uploader.upload(dataUri, {
      folder: "rizz_and_fizz",
      resource_type: "auto",
    });

    return NextResponse.json({ success: true, url: uploadResponse.secure_url });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ success: false, error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
