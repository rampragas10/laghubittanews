import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";

export const runtime = "nodejs";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

async function saveImage(file) {
  if (!file || typeof file === "string") {
    return null;
  }

  if (!ALLOWED_TYPES[file.type]) {
    throw new Error(
      "Invalid image type."
    );
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(
      "Image must be smaller than 5MB."
    );
  }

  const extension =
    ALLOWED_TYPES[file.type];

  const filename = `${crypto.randomUUID()}.${extension}`;

  const directory = path.join(
    process.cwd(),
    "public",
    "uploads"
  );

  await fs.mkdir(directory, {
    recursive: true,
  });

  const buffer = Buffer.from(
    await file.arrayBuffer()
  );

  await fs.writeFile(
    path.join(directory, filename),
    buffer
  );

  return `/uploads/${filename}`;
}

function getArray(formData, key) {
  return formData
    .getAll(key)
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim()
    );
}

export async function PUT(request, context) {
  try {
    await connectDB();

    const { id } = await context.params;

    const news =
      await News.findById(id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "News not found.",
          },
        },
        { status: 404 }
      );
    }

    const formData =
      await request.formData();

    const title =
      formData.get("title");

    const excerpt =
      formData.get("excerpt") || "";

    const content =
      formData.get("content");

    const coverImage =
      formData.get("coverImage") || "";

    const imageAlt =
      formData.get("imageAlt") || "";

    const categories =
      getArray(
        formData,
        "categories"
      );

    const tags =
      getArray(formData, "tags");

    const status =
      formData.get("status") ||
      "draft";

    const featured =
      formData.get("featured") ===
      "true";

    const breaking =
      formData.get("breaking") ===
      "true";

    const readTime = Number(
      formData.get("readTime") || 3
    );

    /*
     * Existing images retained
     */

    const existingImagesRaw =
      formData.get(
        "existingImages"
      );

    let existingImages = [];

    if (existingImagesRaw) {
      try {
        existingImages =
          JSON.parse(
            existingImagesRaw
          );
      } catch {
        existingImages = [];
      }
    }

    /*
     * New images
     */

    const imageFiles =
      formData.getAll("images");

    const newImages = [];

    for (const file of imageFiles) {
      if (
        !file ||
        typeof file === "string"
      ) {
        continue;
      }

      const url =
        await saveImage(file);

      if (url) {
        newImages.push({
          url,
          alt: "",
          caption: "",
        });
      }
    }

    news.title = title;
    news.excerpt = excerpt;
    news.content = content;
    news.coverImage = coverImage;
    news.imageAlt = imageAlt;
    news.categories = categories;
    news.tags = tags;
    news.status = status;
    news.featured = featured;
    news.breaking = breaking;
    news.readTime = readTime;

    news.images = [
      ...existingImages,
      ...newImages,
    ];

    if (
      status === "published" &&
      !news.publishedAt
    ) {
      news.publishedAt = new Date();
    }

    if (
      status !== "published"
    ) {
      news.publishedAt = null;
    }

    await news.save();

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error(
      "UPDATE_NEWS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error.message ||
            "Failed to update news.",
        },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request,
  context
) {
  try {
    await connectDB();

    const { id } = await context.params;

    const news =
      await News.findById(id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "News not found.",
          },
        },
        { status: 404 }
      );
    }

    await news.deleteOne();

    return NextResponse.json({
      success: true,
      message: "News deleted.",
    });
  } catch (error) {
    console.error(
      "DELETE_NEWS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Failed to delete news.",
        },
      },
      { status: 500 }
    );
  }
}