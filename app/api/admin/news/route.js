import { NextResponse } from "next/server";
import mongoose from "mongoose";
import slugify from "slugify";

import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const runtime = "nodejs";

const ALLOWED_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "archived",
];

function parseBoolean(value) {
  return (
    value === true ||
    value === "true" ||
    value === "1" ||
    value === 1
  );
}

function parseJSON(value, fallback = null) {
  if (!value) return fallback;

  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function parseKathmanduDateTime(value) {
  if (!value) return null;

  const match = String(value).match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/
  );

  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const hour = Number(match[4]);
  const minute = Number(match[5]);

  const utcTime = Date.UTC(
    year,
    month - 1,
    day,
    hour,
    minute
  );

  // Nepal UTC +05:45
  return new Date(
    utcTime -
      5 * 60 * 60 * 1000 -
      45 * 60 * 1000
  );
}

async function getValidCategories(categoryIds) {
  const ids = [
    ...new Set(
      categoryIds
        .map((id) => String(id).trim())
        .filter(Boolean)
    ),
  ];

  if (ids.length === 0) {
    return {
      valid: false,
      reason: "NO_CATEGORY_IDS",
      categories: [],
    };
  }

  const invalidObjectIds = ids.filter(
    (id) => !mongoose.Types.ObjectId.isValid(id)
  );

  if (invalidObjectIds.length > 0) {
    return {
      valid: false,
      reason: "INVALID_OBJECT_IDS",
      invalidObjectIds,
      categories: [],
    };
  }

  const foundCategories = await Category.find({
    _id: {
      $in: ids,
    },
  }).select("_id name slug isActive");

  const foundIds = foundCategories.map((category) =>
    category._id.toString()
  );

  const missingIds = ids.filter(
    (id) => !foundIds.includes(id)
  );

  const inactiveCategories =
    foundCategories.filter(
      (category) => category.isActive !== true
    );

  if (missingIds.length > 0) {
    return {
      valid: false,
      reason: "CATEGORY_NOT_FOUND",
      requestedIds: ids,
      missingIds,
      foundCategories,
      categories: [],
    };
  }

  if (inactiveCategories.length > 0) {
    return {
      valid: false,
      reason: "CATEGORY_INACTIVE",
      requestedIds: ids,
      inactiveCategories,
      categories: [],
    };
  }

  return {
    valid: true,
    categories: foundCategories.map(
      (category) => category._id
    ),
  };
}

async function generateUniqueSlug(title) {
  let baseSlug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  if (!baseSlug) {
    baseSlug = `news-${Date.now()}`;
  }

  let slug = baseSlug;
  let counter = 1;

  while (
    await News.exists({
      slug,
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/* =========================================================
   POST /api/admin/news
========================================================= */

export async function POST(request) {
  try {
    await connectDB();

    const formData = await request.formData();

    /* -------------------------
       Basic fields
    ------------------------- */

    const title = String(
      formData.get("title") || ""
    ).trim();

    const excerpt = String(
      formData.get("excerpt") || ""
    ).trim();

    const content = String(
      formData.get("content") || ""
    );

    const coverImage = String(
      formData.get("coverImage") || ""
    ).trim();

    const imageAlt = String(
      formData.get("imageAlt") || ""
    ).trim();

    const status = String(
      formData.get("status") || "draft"
    ).trim();

    const readTime =
      Number(formData.get("readTime")) || 3;

    /* -------------------------
       Categories
    ------------------------- */

    const rawCategories =
      formData.getAll("categories");

    console.log(
      "========================================"
    );

    console.log(
      "RAW CATEGORY VALUES:",
      rawCategories
    );

    const categoryIds = rawCategories
      .map((value) => {
        if (
          value &&
          typeof value === "object" &&
          "value" in value
        ) {
          return String(value.value);
        }

        return String(value);
      })
      .map((value) => value.trim())
      .filter(Boolean);

    console.log(
      "CATEGORY IDS AFTER CLEANING:",
      categoryIds
    );

    /* -------------------------
       Validate categories
    ------------------------- */

    const categoryResult =
      await getValidCategories(categoryIds);

    console.log(
      "CATEGORY VALIDATION RESULT:",
      categoryResult
    );

    if (!categoryResult.valid) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "INVALID_CATEGORIES",
            message:
              "One or more selected categories are invalid or inactive.",
            reason: categoryResult.reason,
            requestedCategoryIds: categoryIds,
            details:
              categoryResult.missingIds ||
              categoryResult.invalidObjectIds ||
              categoryResult.inactiveCategories ||
              [],
          },
        },
        { status: 400 }
      );
    }

    /* -------------------------
       Tags
    ------------------------- */

    const tags = formData
      .getAll("tags")
      .map((tag) => String(tag).trim())
      .filter(Boolean);

    /* -------------------------
       Gallery
    ------------------------- */

    const imagesValue =
      formData.get("images");

    const images = parseJSON(
      imagesValue,
      []
    );

    /* -------------------------
       Flags
    ------------------------- */

    const featured = parseBoolean(
      formData.get("featured")
    );

    const breaking = parseBoolean(
      formData.get("breaking")
    );

    /* -------------------------
       Schedule
    ------------------------- */

    const scheduledAtValue = String(
      formData.get("scheduledAt") || ""
    ).trim();

    let scheduledAt = null;
    let publishedAt = null;

    if (
      !ALLOWED_STATUSES.includes(status)
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Invalid news status.",
          },
        },
        { status: 400 }
      );
    }

    if (!title) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Title is required.",
          },
        },
        { status: 400 }
      );
    }

    if (!content.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: "Content is required.",
          },
        },
        { status: 400 }
      );
    }

    /* -------------------------
       Scheduled
    ------------------------- */

    if (status === "scheduled") {
      scheduledAt =
        parseKathmanduDateTime(
          scheduledAtValue
        );

      if (!scheduledAt) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Please provide a valid scheduled date and time.",
            },
          },
          { status: 400 }
        );
      }

      if (scheduledAt <= new Date()) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Scheduled time must be in the future.",
            },
          },
          { status: 400 }
        );
      }
    }

    /* -------------------------
       Published
    ------------------------- */

    if (status === "published") {
      publishedAt = new Date();
    }

    /* -------------------------
       Slug
    ------------------------- */

    const slug =
      await generateUniqueSlug(title);

    /* -------------------------
       Create
    ------------------------- */

    const news = await News.create({
      title,
      slug,
      excerpt,
      content,

      coverImage,
      imageAlt,

      categories:
        categoryResult.categories,

      tags,

      images:
        Array.isArray(images)
          ? images
          : [],

      status,

      featured,
      breaking,

      readTime,

      views: 0,

      scheduledAt,
      publishedAt,
    });

    console.log(
      "NEWS CREATED:",
      news._id.toString()
    );

    console.log(
      "========================================"
    );

    return NextResponse.json(
      {
        success: true,
        message:
          "News created successfully.",
        data: {
          _id: news._id.toString(),
          title: news.title,
          slug: news.slug,
          status: news.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "CREATE NEWS ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            "Failed to create news.",
          detail:
            process.env.NODE_ENV === "development"
              ? error.message
              : undefined,
        },
      },
      { status: 500 }
    );
  }
}

/* =========================================================
   GET /api/admin/news
========================================================= */

export async function GET() {
  try {
    await connectDB();

    const news = await News.find()
      .populate("categories")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      data: news,
    });
  } catch (error) {
    console.error(
      "GET ADMIN NEWS ERROR:",
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