
import { NextResponse } from "next/server";
import { Readable } from "stream";

import cloudinary from "@/lib/cloudinary";

export const runtime = "nodejs";

// =====================================================
// ALLOWED IMAGE TYPES
// =====================================================

const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
  "image/svg+xml",
];

// =====================================================
// MAX FILE SIZE
// =====================================================

const MAX_FILE_SIZE = 10 * 1024 * 1024;

// =====================================================
// POST /api/admin/upload
// =====================================================

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("file");

    // -------------------------------------------------
    // Validate file
    // -------------------------------------------------

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          message: "Image file is required.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Validate file type
    // -------------------------------------------------

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Unsupported image format. Allowed: JPG, JPEG, PNG, WebP, GIF, AVIF and SVG.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Validate file size
    // -------------------------------------------------

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          message: "Image must be smaller than 10MB.",
        },
        { status: 400 }
      );
    }

    // -------------------------------------------------
    // Convert file to Buffer
    // -------------------------------------------------

    const bytes = await file.arrayBuffer();

    const buffer = Buffer.from(bytes);

    // -------------------------------------------------
    // Upload to Cloudinary
    // -------------------------------------------------

    const result = await new Promise((resolve, reject) => {
      const uploadStream =
        cloudinary.uploader.upload_stream(
          {
            folder: "laghubitta-ads",
            resource_type: "image",

            // Keep animated GIFs animated.
            // Cloudinary handles the image format.
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
    });

    // -------------------------------------------------
    // Success
    // -------------------------------------------------

    return NextResponse.json({
      success: true,

      message: "Advertisement image uploaded successfully.",

      url: result.secure_url,

      data: {
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format,
        resourceType: result.resource_type,
        bytes: result.bytes,
      },
    });
  } catch (error) {
    console.error(
      "ADVERTISEMENT_IMAGE_UPLOAD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message: "Failed to upload advertisement image.",
      },
      { status: 500 }
    );
  }
}
