
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import slugify from "slugify";

import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

/*
 * =========================================
 * CONFIG
 * =========================================
 */

const ALLOWED_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "archived",
];

/*
 * =========================================
 * OBJECT ID VALIDATION
 * =========================================
 */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/*
 * =========================================
 * BOOLEAN PARSER
 * =========================================
 */

function parseBoolean(value) {
  return (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1
  );
}

/*
 * =========================================
 * ARRAY PARSER
 * =========================================
 */

function getArray(formData, key) {
  return formData
    .getAll(key)
    .filter(
      (value) =>
        typeof value === "string" &&
        value.trim()
    )
    .map((value) => value.trim());
}

/*
 * =========================================
 * JSON PARSER
 * =========================================
 */

function parseJSON(value, fallback = null) {
  if (!value) {
    return fallback;
  }

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

/*
 * =========================================
 * COVER IMAGE PARSER
 * =========================================
 *
 * Current structure:
 *
 * {
 *   url: "...",
 *   alt: "..."
 * }
 *
 * Also supports old records where
 * coverImage was simply a string URL.
 */

function parseCoverImage(value) {
  const emptyImage = {
    url: "",
    alt: "",
  };

  if (!value) {
    return emptyImage;
  }

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    /*
     * If JSON parsing produced an object,
     * normalize it.
     */

    if (
      parsed &&
      typeof parsed === "object" &&
      !Array.isArray(parsed)
    ) {
      return {
        url:
          typeof parsed.url === "string"
            ? parsed.url.trim()
            : "",

        alt:
          typeof parsed.alt === "string"
            ? parsed.alt.trim()
            : "",
      };
    }

    /*
     * Backward compatibility:
     *
     * If an old record sends:
     *
     * "https://..."
     */

    if (
      typeof parsed === "string" &&
      parsed.trim()
    ) {
      return {
        url: parsed.trim(),
        alt: "",
      };
    }

    return emptyImage;
  } catch {
    /*
     * If the value wasn't valid JSON,
     * treat it as a plain URL.
     */

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return {
        url: value.trim(),
        alt: "",
      };
    }

    return emptyImage;
  }
}

/*
 * =========================================
 * GALLERY IMAGE PARSER
 * =========================================
 *
 * Current structure:
 *
 * {
 *   url,
 *   alt,
 *   caption
 * }
 */

function parseGalleryImages(value) {
  if (!value) {
    return [];
  }

  let parsed;

  try {
    parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;
  } catch {
    throw new Error(
      "Invalid gallery images data."
    );
  }

  if (!Array.isArray(parsed)) {
    return [];
  }

  return parsed
    .filter(
      (image) =>
        image &&
        typeof image === "object" &&
        typeof image.url === "string" &&
        image.url.trim()
    )
    .map((image) => ({
      url: image.url.trim(),

      alt:
        typeof image.alt === "string"
          ? image.alt.trim()
          : "",

      caption:
        typeof image.caption === "string"
          ? image.caption.trim()
          : "",
    }));
}

/*
 * =========================================
 * EXISTING DATABASE GALLERY NORMALIZER
 * =========================================
 *
 * This is important for older documents.
 */

function normalizeExistingImages(images) {
  if (!Array.isArray(images)) {
    return [];
  }

  return images
    .map((image) => {
      /*
       * New format
       */

      if (
        image &&
        typeof image === "object"
      ) {
        return {
          url:
            typeof image.url === "string"
              ? image.url.trim()
              : "",

          alt:
            typeof image.alt === "string"
              ? image.alt.trim()
              : "",

          caption:
            typeof image.caption ===
            "string"
              ? image.caption.trim()
              : "",
        };
      }

      /*
       * Ignore invalid entries.
       */

      return null;
    })
    .filter(
      (image) =>
        image && image.url
    );
}

/*
 * =========================================
 * CATEGORY VALIDATION
 * =========================================
 */

async function validateCategories(
  categoryIds
) {
  const uniqueIds = [
    ...new Set(
      categoryIds
        .map((id) =>
          String(id).trim()
        )
        .filter(Boolean)
    ),
  ];

  if (!uniqueIds.length) {
    return {
      valid: false,
      reason: "NO_CATEGORIES",
    };
  }

  /*
   * Check ObjectIds first.
   */

  const invalidIds =
    uniqueIds.filter(
      (id) =>
        !isValidObjectId(id)
    );

  if (invalidIds.length) {
    return {
      valid: false,
      reason: "INVALID_OBJECT_IDS",
      invalidIds,
    };
  }

  /*
   * Find active categories.
   */

  const categories =
    await Category.find({
      _id: {
        $in: uniqueIds,
      },
      isActive: true,
    }).select("_id");

  const foundIds =
    categories.map((category) =>
      category._id.toString()
    );

  const missingIds =
    uniqueIds.filter(
      (id) =>
        !foundIds.includes(id)
    );

  if (missingIds.length) {
    return {
      valid: false,
      reason: "CATEGORY_NOT_FOUND_OR_INACTIVE",
      missingIds,
    };
  }

  return {
    valid: true,
    categories:
      categories.map(
        (category) => category._id
      ),
  };
}

/*
 * =========================================
 * UNIQUE SLUG
 * =========================================
 */

async function generateUniqueSlug(
  title,
  currentId
) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  /*
   * Nepali-only title may produce
   * an empty slug.
   */

  if (!baseSlug) {
    baseSlug = `news-${Date.now()}`;
  }

  let slug = baseSlug;

  /*
   * Don't consider current article
   * when checking duplicate slug.
   */

  const existing =
    await News.findOne({
      slug,
      _id: {
        $ne: currentId,
      },
    }).select("_id");

  if (existing) {
    slug = `${baseSlug}-${Date.now()}`;
  }

  return slug;
}

/*
 * =========================================
 * SCHEDULE DATE PARSER
 * =========================================
 *
 * datetime-local gives:
 *
 * YYYY-MM-DDTHH:mm
 *
 * JavaScript may interpret this using
 * server timezone. Since your app is
 * using Kathmandu time, explicitly convert
 * Kathmandu time to UTC.
 */

function parseKathmanduDateTime(
  value
) {
  if (!value) {
    return null;
  }

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  /*
   * Nepal = UTC + 5:45
   *
   * Convert Kathmandu local time
   * into UTC.
   */

  const utcTime = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  return new Date(
    utcTime -
      5 * 60 * 60 * 1000 -
      45 * 60 * 1000
  );
}

/*
 * =========================================
 * GET SINGLE NEWS
 * =========================================
 */

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

    /*
     * Validate ID.
     */

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Fetch news.
     */

    const news =
      await News.findById(id)
        .populate("categories")
        .lean();

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message:
              "News article not found.",
          },
        },
        { status: 404 }
      );
    }

    /*
     * Normalize old coverImage data
     * before returning it.
     */

    if (
      typeof news.coverImage ===
      "string"
    ) {
      news.coverImage = {
        url: news.coverImage,
        alt:
          news.imageAlt || "",
      };
    }

    /*
     * Normalize gallery.
     */

    news.images =
      normalizeExistingImages(
        news.images
      );

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error(
      "GET_NEWS_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Failed to fetch news.",
        },
      },
      { status: 500 }
    );
  }
}

/*
 * =========================================
 * UPDATE NEWS
 * =========================================
 */

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;

    /*
     * =====================================
     * VALIDATE ID
     * =====================================
     */

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * =====================================
     * FIND EXISTING NEWS
     * =====================================
     */

    const existingNews =
      await News.findById(id);

    if (!existingNews) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message:
              "News article not found.",
          },
        },
        { status: 404 }
      );
    }

    /*
     * =====================================
     * READ FORM DATA
     * =====================================
     */

    const formData =
      await request.formData();

    /*
     * =====================================
     * BASIC FIELDS
     * =====================================
     */

    const title = String(
      formData.get("title") || ""
    ).trim();

    const excerpt = String(
      formData.get("excerpt") || ""
    ).trim();

    const content = String(
      formData.get("content") || ""
    ).trim();

    /*
     * =====================================
     * COVER IMAGE
     * =====================================
     */

    const rawCoverImage =
      formData.get("coverImage");

    let coverImage;

    try {
      coverImage =
        parseCoverImage(
          rawCoverImage
        );
    } catch (error) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_COVER_IMAGE",
            message:
              error.message ||
              "Invalid cover image data.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * CATEGORIES
     * =====================================
     */

    const categories =
      getArray(
        formData,
        "categories"
      );

    /*
     * =====================================
     * TAGS
     * =====================================
     */

    let tags = [];

    const rawTags =
      formData.get("tags");

    if (
      typeof rawTags === "string"
    ) {
      const parsedTags =
        parseJSON(
          rawTags,
          null
        );

      if (
        Array.isArray(parsedTags)
      ) {
        tags = parsedTags
          .map((tag) =>
            String(tag).trim()
          )
          .filter(Boolean);
      } else {
        tags = rawTags
          .split(",")
          .map((tag) =>
            tag.trim()
          )
          .filter(Boolean);
      }
    }

    /*
     * =====================================
     * STATUS
     * =====================================
     */

    const status = String(
      formData.get("status") ||
        existingNews.status ||
        "draft"
    ).trim();

    if (
      !ALLOWED_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_STATUS",
            message:
              "Invalid news status.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * FEATURED / BREAKING
     * =====================================
     */

    const featured =
      parseBoolean(
        formData.get("featured")
      );

    const breaking =
      parseBoolean(
        formData.get("breaking")
      );

    /*
     * =====================================
     * READ TIME
     * =====================================
     */

    const readTimeValue =
      Number(
        formData.get(
          "readTime"
        ) || 3
      );

    const readTime =
      Number.isFinite(
        readTimeValue
      ) &&
      readTimeValue > 0
        ? Math.round(
            readTimeValue
          )
        : 3;

    /*
     * =====================================
     * VALIDATION
     * =====================================
     */

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TITLE_REQUIRED",
            message:
              "Title is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CONTENT_REQUIRED",
            message:
              "Content is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!categories.length) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "CATEGORY_REQUIRED",
            message:
              "At least one category is required.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * VALIDATE CATEGORIES
     * =====================================
     */

    const categoryResult =
      await validateCategories(
        categories
      );

    if (!categoryResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CATEGORIES",
            message:
              "One or more selected categories are invalid or inactive.",
            reason:
              categoryResult.reason,
            details:
              categoryResult.missingIds ||
              categoryResult.invalidIds ||
              [],
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * SCHEDULE / PUBLISHING
     * =====================================
     */

    const scheduledAtValue =
      String(
        formData.get(
          "scheduledAt"
        ) || ""
      ).trim();

    let scheduledAt = null;

    let publishedAt =
      existingNews.publishedAt ||
      null;

    /*
     * -------------------------------------
     * DRAFT
     * -------------------------------------
     */

    if (status === "draft") {
      scheduledAt = null;
      publishedAt = null;
    }

    /*
     * -------------------------------------
     * SCHEDULED
     * -------------------------------------
     */

    if (status === "scheduled") {
      if (!scheduledAtValue) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SCHEDULED_TIME_REQUIRED",
              message:
                "Scheduled date and time are required.",
            },
          },
          { status: 400 }
        );
      }

      scheduledAt =
        parseKathmanduDateTime(
          scheduledAtValue
        );

      if (!scheduledAt) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_SCHEDULED_TIME",
              message:
                "Invalid scheduled date and time.",
            },
          },
          { status: 400 }
        );
      }

      if (
        scheduledAt <= new Date()
      ) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "SCHEDULED_TIME_IN_PAST",
              message:
                "Scheduled time must be in the future.",
            },
          },
          { status: 400 }
        );
      }

      publishedAt = null;
    }

    /*
     * -------------------------------------
     * PUBLISHED
     * -------------------------------------
     */

    if (status === "published") {
      /*
       * Preserve original publication
       * date when editing an already
       * published article.
       */

      if (!existingNews.publishedAt) {
        publishedAt = new Date();
      }

      scheduledAt = null;
    }

    /*
     * -------------------------------------
     * ARCHIVED
     * -------------------------------------
     */

    if (status === "archived") {
      scheduledAt = null;

      /*
       * Keep historical publishedAt
       * if the article was previously
       * published.
       */

      if (
        !existingNews.publishedAt
      ) {
        publishedAt = null;
      }
    }

    /*
     * =====================================
     * SLUG
     * =====================================
     */

    let slug =
      existingNews.slug;

    if (
      existingNews.title !==
      title
    ) {
      slug =
        await generateUniqueSlug(
          title,
          id
        );
    }

    /*
     * =====================================
     * GALLERY
     * =====================================
     *
     * NewsForm sends:
     *
     * images = JSON.stringify([
     *   {
     *     url,
     *     alt,
     *     caption
     *   }
     * ])
     *
     * We replace the existing gallery
     * with exactly what the frontend sends.
     *
     * This means:
     *
     * - removed image => removed from DB
     * - existing image => preserved
     * - new image => added
     */

    let images = [];

    const rawImages =
      formData.get("images");

    if (
      typeof rawImages === "string"
    ) {
      try {
        images =
          parseGalleryImages(
            rawImages
          );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_GALLERY_IMAGES",
              message:
                error.message ||
                "Invalid gallery images data.",
            },
          },
          { status: 400 }
        );
      }
    } else {
      /*
       * If frontend doesn't send images,
       * preserve existing gallery.
       */

      images =
        normalizeExistingImages(
          existingNews.images
        );
    }

    /*
     * =====================================
     * UPDATE DOCUMENT
     * =====================================
     */

    existingNews.title =
      title;

    existingNews.slug =
      slug;

    existingNews.excerpt =
      excerpt;

    existingNews.content =
      content;

    /*
     * IMPORTANT:
     *
     * coverImage is:
     *
     * {
     *   url,
     *   alt
     * }
     */

    existingNews.coverImage =
      coverImage;

    existingNews.categories =
      categoryResult.categories;

    existingNews.tags =
      tags;

    existingNews.images =
      images;

    existingNews.status =
      status;

    existingNews.featured =
      featured;

    existingNews.breaking =
      breaking;

    existingNews.readTime =
      readTime;

    existingNews.scheduledAt =
      scheduledAt;

    existingNews.publishedAt =
      publishedAt;

    /*
     * =====================================
     * SAVE
     * =====================================
     */

    await existingNews.save();

    /*
     * =====================================
     * RESPONSE
     * =====================================
     */

    const updatedNews =
      await News.findById(id)
        .populate("categories")
        .lean();

    /*
     * Normalize cover image for
     * backwards compatibility.
     */

    if (
      typeof updatedNews.coverImage ===
      "string"
    ) {
      updatedNews.coverImage = {
        url:
          updatedNews.coverImage,
        alt:
          updatedNews.imageAlt ||
          "",
      };
    }

    /*
     * Normalize gallery.
     */

    updatedNews.images =
      normalizeExistingImages(
        updatedNews.images
      );

    /*
     * =====================================
     * SUCCESS MESSAGE
     * =====================================
     */

    let message =
      "News updated successfully.";

    if (status === "draft") {
      message =
        "News saved as draft.";
    }

    if (status === "scheduled") {
      message =
        "News scheduled successfully.";
    }

    if (status === "published") {
      message =
        "News published successfully.";
    }

    if (status === "archived") {
      message =
        "News archived successfully.";
    }

    return NextResponse.json(
      {
        success: true,
        message,
        data: updatedNews,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "UPDATE_NEWS_ERROR:",
      error
    );

    /*
     * =====================================
     * MONGOOSE VALIDATION ERROR
     * =====================================
     */

    if (
      error?.name ===
      "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message:
              "News validation failed.",
            details:
              Object.fromEntries(
                Object.entries(
                  error.errors || {}
                ).map(
                  ([field, value]) => [
                    field,
                    value.message,
                  ]
                )
              ),
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * DUPLICATE KEY
     * =====================================
     */

    if (
      error?.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "DUPLICATE_RESOURCE",
            message:
              "A news article with this slug already exists.",
          },
        },
        { status: 409 }
      );
    }

    /*
     * =====================================
     * GENERIC ERROR
     * =====================================
     */

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Failed to update news.",
          detail:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/*
 * =========================================
 * DELETE NEWS
 * =========================================
 *
 * IMPORTANT:
 *
 * We are NOT deleting anything from
 * Cloudinary here because the current
 * MongoDB schema does not store Cloudinary
 * publicId.
 *
 * The database record is deleted safely.
 *
 * Cloudinary cleanup can be added later
 * when publicId is stored in the schema.
 */

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;

    /*
     * =====================================
     * VALIDATE ID
     * =====================================
     */

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_ID",
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * =====================================
     * FIND NEWS
     * =====================================
     */

    const news =
      await News.findById(id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "RESOURCE_NOT_FOUND",
            message:
              "News article not found.",
          },
        },
        { status: 404 }
      );
    }

    /*
     * =====================================
     * DELETE DATABASE RECORD
     * =====================================
     */

    await News.findByIdAndDelete(id);

    /*
     * =====================================
     * RESPONSE
     * =====================================
     */

    return NextResponse.json({
      success: true,
      message:
        "News deleted successfully.",
      data: {
        id,
        title: news.title,
      },
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
          detail:
            process.env.NODE_ENV ===
            "development"
              ? error?.message
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}
