
import { NextResponse } from "next/server";

import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

export async function POST(request) {
  try {
    const formData = await request.formData();

    const file = formData.get("upload");

    if (!file || typeof file === "string") {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "No image was uploaded.",
          },
        },
        { status: 400 }
      );
    }

    // Validate MIME type
    if (!ALLOWED_TYPES[file.type]) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid image type. Use JPG, PNG, WEBP or GIF.",
          },
        },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Image must be smaller than 5MB.",
          },
        },
        { status: 400 }
      );
    }

    const extension =
      ALLOWED_TYPES[file.type];

    const filename =
      `${crypto.randomUUID()}.${extension}`;

    const uploadDirectory =
      path.join(
        process.cwd(),
        "public",
        "uploads"
      );

    await fs.mkdir(
      uploadDirectory,
      {
        recursive: true,
      }
    );

    const bytes =
      await file.arrayBuffer();

    const buffer =
      Buffer.from(bytes);

    const filePath =
      path.join(
        uploadDirectory,
        filename
      );

    await fs.writeFile(
      filePath,
      buffer
    );

    const url =
      `/uploads/${filename}`;

    /*
     * IMPORTANT:
     *
     * CKEditor SimpleUploadAdapter
     * expects:
     *
     * {
     *   "url": "/uploads/image.jpg"
     * }
     *
     * We can include our own fields too.
     */

    return NextResponse.json({
      success: true,
      url,
    });
  } catch (error) {
    console.error(
      "IMAGE_UPLOAD_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Image upload failed.",
        },
      },
      { status: 500 }
    );
  }
}
