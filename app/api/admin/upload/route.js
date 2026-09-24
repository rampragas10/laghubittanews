
import { NextResponse } from "next/server";
import { Readable } from "stream";

import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024;

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    // =========================
    // Validate file
    // =========================
    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and WebP images are allowed",
        },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 5MB",
        },
        { status: 400 }
      );
    }

    // =========================
    // Convert file to Buffer
    // =========================
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // =========================
    // Upload to Cloudinary
    // =========================
    const result = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "laghubitta-news",
              resource_type: "image",
            },
            (error, uploadResult) => {
              if (error) {
                reject(error);
              } else {
                resolve(uploadResult);
              }
            }
          );

        Readable.from(buffer).pipe(uploadStream);
      }
    );

    // =========================
    // Response
    //
    // IMPORTANT:
    // CKEditor SimpleUploadAdapter
    // expects `url` at the top level.
    //
    // NewsForm can use `data.url`.
    // =========================
    return NextResponse.json({
      success: true,
      message: "Image uploaded successfully",

      // CKEditor
      url: result.secure_url,

      // NewsForm / other clients
      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error(
      "Cloudinary upload error:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image",
      },
      { status: 500 }
    );
  }
}
