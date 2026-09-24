import { NextResponse } from "next/server";
import { Readable } from "stream";

import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

// ============================================
// CONFIG
// ============================================

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// ============================================
// POST /api/admin/upload
// ============================================

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    // ========================================
    // FILE REQUIRED
    // ========================================

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // FILE TYPE
    // ========================================

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Only JPG, PNG and WebP images are allowed.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // FILE SIZE
    // ========================================

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Image must be smaller than 5MB.",
        },
        {
          status: 400,
        }
      );
    }

    // ========================================
    // FILE → BUFFER
    // ========================================

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    // ========================================
    // CLOUDINARY UPLOAD
    // ========================================

    const result = await new Promise(
      (resolve, reject) => {
        const uploadStream =
          cloudinary.uploader.upload_stream(
            {
              folder: "laghubitta-news",
              resource_type: "image",
            },

            (error, result) => {
              if (error) {
                reject(error);
              } else {
                resolve(result);
              }
            }
          );

        Readable.from(buffer).pipe(
          uploadStream
        );
      }
    );

    // ========================================
    // RESPONSE
    // ========================================

    return NextResponse.json({
      success: true,

      message:
        "Image uploaded successfully.",

      data: {
        url: result.secure_url,

        // Returned to frontend.
        // We don't store it in News currently.
        publicId: result.public_id,

        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error(
      "CLOUDINARY UPLOAD ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload image.",

        detail:
          process.env.NODE_ENV ===
          "development"
            ? error.message
            : undefined,
      },
      {
        status: 500,
      }
    );
  }
}