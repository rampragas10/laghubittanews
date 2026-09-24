
import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import slugify from "slugify";
import mongoose from "mongoose";
import cloudinary from "@/lib/cloudinary";

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
 * MONGODB ID VALIDATION
 * =========================================
 */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}

/*
 * =========================================
 * ARRAY HELPER
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
 * CLOUDINARY COVER IMAGE PARSER
 * =========================================
 */

function parseCoverImage(value) {
  /*
   * Default empty Cloudinary image object.
   */

  const emptyImage = {
    url: "",
    publicId: "",
  };

  if (!value) {
    return emptyImage;
  }

  /*
   * FormData normally sends the object
   * as a JSON string.
   *
   * Example:
   *
   * "{\"url\":\"https://...\",\"publicId\":\"...\"}"
   */

  try {
    const parsed =
      typeof value === "string"
        ? JSON.parse(value)
        : value;

    /*
     * Make sure the parsed value is
     * actually an object.
     */

    if (
      !parsed ||
      typeof parsed !== "object" ||
      Array.isArray(parsed)
    ) {
      return emptyImage;
    }

    return {
      url:
        typeof parsed.url === "string"
          ? parsed.url.trim()
          : "",

      publicId:
        typeof parsed.publicId === "string"
          ? parsed.publicId.trim()
          : "",
    };
  } catch (error) {
    /*
     * Backward compatibility for an old
     * record that may contain a plain URL.
     */

    if (
      typeof value === "string" &&
      value.trim()
    ) {
      return {
        url: value.trim(),
        publicId: "",
      };
    }

    throw new Error(
      "Invalid cover image data."
    );
  }
}

/*
 * =========================================
 * GALLERY IMAGE PARSER
 * =========================================
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

      publicId:
        typeof image.publicId === "string"
          ? image.publicId.trim()
          : "",

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
 * CATEGORY VALIDATION
 * =========================================
 */

async function validateCategories(
  categoryIds
) {
  if (!categoryIds.length) {
    return false;
  }

  const uniqueIds = [
    ...new Set(categoryIds),
  ];

  if (
    uniqueIds.some(
      (id) => !isValidObjectId(id)
    )
  ) {
    return false;
  }

  const categories =
    await Category.find({
      _id: {
        $in: uniqueIds,
      },
      isActive: true,
    }).select("_id");

  return (
    categories.length ===
    uniqueIds.length
  );
}

/*
 * =========================================
 * SLUG GENERATOR
 * =========================================
 */

async function generateUniqueSlug(
  title,
  currentId
) {
  let slug = slugify(title, {
    lower: true,
    strict: true,
    trim: true,
  });

  /*
   * Nepali titles may produce an empty slug.
   */

  if (!slug) {
    slug = `news-${Date.now()}`;
  }

  const query = {
    slug,
  };

  /*
   * When editing an article, don't
   * consider the current article as
   * a duplicate.
   */

  if (currentId) {
    query._id = {
      $ne: currentId,
    };
  }

  const existing =
    await News.findOne(query)
      .select("_id");

  if (existing) {
    slug = `${slug}-${Date.now()}`;
  }

  return slug;
}

/*
 * =========================================
 * SCHEDULE DATE PARSER
 * =========================================
 */

function parseScheduledAt(value) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }

  return date;
}

/*
 * =========================================
 * DELETE CLOUDINARY IMAGE
 * =========================================
 */

async function deleteCloudinaryImage(
  publicId
) {
  try {
    if (
      !publicId ||
      typeof publicId !== "string"
    ) {
      return;
    }

    await cloudinary.uploader.destroy(
      publicId,
      {
        resource_type: "image",
      }
    );

    console.log(
      "Cloudinary image deleted:",
      publicId
    );
  } catch (error) {
    /*
     * Do not fail the whole news
     * operation because an image could
     * not be deleted.
     */

    console.error(
      "CLOUDINARY_DELETE_ERROR:",
      error
    );
  }
}

/*
 * =========================================
 * DELETE CLOUDINARY IMAGE IF REPLACED
 * =========================================
 */

async function deleteOldCoverImage(
  oldImage,
  newImage
) {
  const oldPublicId =
    oldImage?.publicId;

  const newPublicId =
    newImage?.publicId;

  /*
   * Nothing to delete.
   */

  if (!oldPublicId) {
    return;
  }

  /*
   * Same image is still being used.
   */

  if (
    oldPublicId === newPublicId
  ) {
    return;
  }

  await deleteCloudinaryImage(
    oldPublicId
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
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Find article.
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
            message:
              "News article not found.",
          },
        },
        { status: 404 }
      );
    }

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
     * Validate ID before touching
     * MongoDB.
     */

    if (!isValidObjectId(id)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Find existing article.
     */

    const existingNews =
      await News.findById(id);

    if (!existingNews) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "News article not found.",
          },
        },
        { status: 404 }
      );
    }

    const formData =
      await request.formData();

    /*
     * =====================================
     * BASIC FIELDS
     * =====================================
     */

    const title = String(
      formData.get("title") ||
        ""
    ).trim();

    const excerpt = String(
      formData.get("excerpt") ||
        ""
    ).trim();

    const content = String(
      formData.get("content") ||
        ""
    ).trim();

    /*
     * =====================================
     * COVER IMAGE
     * =====================================
     *
     * IMPORTANT:
     *
     * NewsForm sends:
     *
     * JSON.stringify({
     *   url,
     *   publicId
     * })
     *
     * We MUST parse it back into an
     * object before giving it to Mongoose.
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
            message:
              error.message ||
              "Invalid cover image data.",
          },
        },
        { status: 400 }
      );
    }

    const imageAlt = String(
      formData.get("imageAlt") ||
        ""
    ).trim();

    /*
     * =====================================
     * ARRAYS
     * =====================================
     */

    const categories =
      getArray(
        formData,
        "categories"
      );

    const tags =
      getArray(
        formData,
        "tags"
      );

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

    /*
     * =====================================
     * SCHEDULE
     * =====================================
     */

    const scheduledAtValue =
      String(
        formData.get(
          "scheduledAt"
        ) || ""
      ).trim();

    /*
     * =====================================
     * BOOLEAN FIELDS
     * =====================================
     */

    const featured =
      formData.get("featured") ===
      "true";

    const breaking =
      formData.get("breaking") ===
      "true";

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
            message:
              "At least one category is required.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * Validate status.
     */

    if (
      !ALLOWED_STATUSES.includes(
        status
      )
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Invalid news status.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * Validate categories.
     */

    const validCategories =
      await validateCategories(
        categories
      );

    if (!validCategories) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "One or more selected categories are invalid or inactive.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * PUBLISHING LOGIC
     * =====================================
     */

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
              message:
                "Scheduled date and time are required.",
            },
          },
          { status: 400 }
        );
      }

      scheduledAt =
        parseScheduledAt(
          scheduledAtValue
        );

      if (!scheduledAt) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Invalid scheduled date and time.",
            },
          },
          { status: 400 }
        );
      }

      if (
        scheduledAt <=
        new Date()
      ) {
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

      publishedAt = null;
    }

    /*
     * -------------------------------------
     * PUBLISHED
     * -------------------------------------
     */

    if (status === "published") {
      /*
       * Preserve the original
       * publication date if already
       * published.
       */

      if (!existingNews.publishedAt) {
        publishedAt =
          new Date();
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
       * Keep publishedAt for historical
       * record if already published.
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
     * EXISTING GALLERY IMAGES
     * =====================================
     */

    let existingImages = [];

    const existingImagesValue =
      formData.get(
        "existingImages"
      );

    if (
      typeof existingImagesValue ===
      "string"
    ) {
      try {
        existingImages =
          parseGalleryImages(
            existingImagesValue
          );
      } catch (error) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                error.message ||
                "Invalid existing images data.",
            },
          },
          { status: 400 }
        );
      }
    } else {
      /*
       * Preserve old gallery if the
       * frontend doesn't send the field.
       */

      existingImages =
        Array.isArray(
          existingNews.images
        )
          ? existingNews.images
              .map(
                (image) => ({
                  url:
                    image?.url ||
                    "",

                  publicId:
                    image?.publicId ||
                    "",

                  alt:
                    image?.alt ||
                    "",

                  caption:
                    image?.caption ||
                    "",
                })
              )
              .filter(
                (image) =>
                  image.url
              )
          : [];
    }

    /*
     * =====================================
     * NEW GALLERY IMAGES
     * =====================================
     *
     * New NewsForm uploads gallery
     * images directly to Cloudinary.
     *
     * Therefore there should normally
     * be NO image file here.
     *
     * We still preserve compatibility
     * with an actual File if one is sent.
     */

    const imageFiles =
      formData.getAll(
        "images"
      );

    const uploadedImages = [];

    /*
     * The new Cloudinary frontend sends
     * JSON gallery objects rather than
     * raw files.
     *
     * Therefore only process actual
     * File objects here.
     */

    for (
      const file of imageFiles
    ) {
      if (
        !file ||
        typeof file === "string"
      ) {
        continue;
      }

      /*
       * This route is now Cloudinary-based.
       *
       * Do NOT save files to /public/uploads.
       *
       * If a raw file reaches this route,
       * reject it rather than silently
       * storing it locally.
       */

      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "Gallery images must be uploaded through the Cloudinary upload endpoint.",
          },
        },
        { status: 400 }
      );
    }

    /*
     * =====================================
     * COMBINE GALLERY
     * =====================================
     */

    const images = [
      ...existingImages,
      ...uploadedImages,
    ];

    /*
     * =====================================
     * SAVE NEW COVER IMAGE
     * =====================================
     */

    /*
     * Keep a copy of the old image
     * before replacing it.
     */

    const oldCoverImage =
      existingNews.coverImage;

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
     * coverImage is now an OBJECT,
     * not a string.
     */

    existingNews.coverImage =
      coverImage;

    existingNews.imageAlt =
      imageAlt;

    existingNews.categories =
      categories;

    existingNews.tags =
      tags;

    existingNews.status =
      status;

    existingNews.scheduledAt =
      scheduledAt;

    existingNews.publishedAt =
      publishedAt;

    existingNews.featured =
      featured;

    existingNews.breaking =
      breaking;

    existingNews.readTime =
      readTime;

    existingNews.images =
      images;

    /*
     * =====================================
     * SAVE
     * =====================================
     */

    await existingNews.save();

    /*
     * =====================================
     * DELETE OLD COVER FROM CLOUDINARY
     * =====================================
     *
     * Only after MongoDB successfully
     * saves the new document.
     */

    await deleteOldCoverImage(
      oldCoverImage,
      coverImage
    );

    /*
     * =====================================
     * RESPONSE
     * =====================================
     */

    const updatedNews =
      await News.findById(id)
        .populate("categories")
        .lean();

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
     * Mongoose validation
     */

    if (
      error?.name ===
      "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
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
     * Duplicate slug
     */

    if (
      error?.code === 11000
    ) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message:
              "A news article with this slug already exists.",
          },
        },
        { status: 409 }
      );
    }

    /*
     * Generic error
     */

    return NextResponse.json(
      {
        success: false,
        error: {
          message:
            error?.message ||
            "Failed to update news.",
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
 */

export async function DELETE(
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
            message:
              "Invalid news ID.",
          },
        },
        { status: 400 }
      );
    }

    await connectDB();

    /*
     * Find article first.
     */

    const news =
      await News.findById(id);

    if (!news) {
      return NextResponse.json(
        {
          success: false,
          error: {
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
     * DELETE COVER FROM CLOUDINARY
     * =====================================
     */

    if (
      news.coverImage?.publicId
    ) {
      await deleteCloudinaryImage(
        news.coverImage.publicId
      );
    }

    /*
     * =====================================
     * DELETE GALLERY IMAGES
     * =====================================
     */

    if (
      Array.isArray(news.images)
    ) {
      for (
        const image of news.images
      ) {
        if (
          image?.publicId
        ) {
          await deleteCloudinaryImage(
            image.publicId
          );
        }
      }
    }

    /*
     * =====================================
     * RESPONSE
     * =====================================
     */

    return NextResponse.json({
      success: true,
      message:
        "News deleted successfully.",
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
