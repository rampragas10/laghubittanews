// // import { connectDB } from "@/lib/db";
// // import News from "@/models/News";
// // import { requireAdmin } from "@/lib/admin-api";
// // import { fail, ok } from "@/lib/api";
// // import { makeSlug } from "@/lib/slug";

// // export async function PUT(req,{params}){
// //   if(!await requireAdmin())return fail("Unauthorized",401);
// //   try{
// //     const {id}=await params; const body=await req.json(); await connectDB();
// //     const current=await News.findById(id); if(!current)return fail("News not found",404);
// //     if(body.title && body.title!==current.title) body.slug=makeSlug(body.title)+"-"+Date.now();
// //     if(body.status==="published" && current.status!=="published")body.publishedAt=new Date();
// //     if(body.status!=="published")body.publishedAt=null;
// //     const updated=await News.findByIdAndUpdate(id,body,{new:true,runValidators:true}).populate("category");
// //     return ok(updated);
// //   }catch(e){return fail(e.message,400);}
// // }

// // export async function DELETE(req,{params}){
// //   if(!await requireAdmin())return fail("Unauthorized",401);
// //   await connectDB(); const {id}=await params; const deleted=await News.findByIdAndDelete(id);
// //   if(!deleted)return fail("News not found",404);
// //   return ok({deleted:true});
// // }










// import { NextResponse } from "next/server";
// import { connectDB } from "@/lib/db";
// import News from "@/models/News";
// import fs from "fs/promises";
// import path from "path";
// import crypto from "crypto";

// export const runtime = "nodejs";

// const ALLOWED_TYPES = {
//   "image/jpeg": "jpg",
//   "image/png": "png",
//   "image/webp": "webp",
//   "image/gif": "gif",
// };

// const MAX_FILE_SIZE = 5 * 1024 * 1024;

// async function saveImage(file) {
//   if (!file || typeof file === "string") {
//     return null;
//   }

//   if (!ALLOWED_TYPES[file.type]) {
//     throw new Error(
//       "Invalid image type."
//     );
//   }

//   if (file.size > MAX_FILE_SIZE) {
//     throw new Error(
//       "Image must be smaller than 5MB."
//     );
//   }

//   const extension =
//     ALLOWED_TYPES[file.type];

//   const filename = `${crypto.randomUUID()}.${extension}`;

//   const directory = path.join(
//     process.cwd(),
//     "public",
//     "uploads"
//   );

//   await fs.mkdir(directory, {
//     recursive: true,
//   });

//   const buffer = Buffer.from(
//     await file.arrayBuffer()
//   );

//   await fs.writeFile(
//     path.join(directory, filename),
//     buffer
//   );

//   return `/uploads/${filename}`;
// }

// function getArray(formData, key) {
//   return formData
//     .getAll(key)
//     .filter(
//       (value) =>
//         typeof value === "string" &&
//         value.trim()
//     );
// }

// export async function PUT(request, context) {
//   try {
//     await connectDB();

//     const { id } = await context.params;

//     const news =
//       await News.findById(id);

//     if (!news) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: {
//             message:
//               "News not found.",
//           },
//         },
//         { status: 404 }
//       );
//     }

//     const formData =
//       await request.formData();

//     const title =
//       formData.get("title");

//     const excerpt =
//       formData.get("excerpt") || "";

//     const content =
//       formData.get("content");

//     const coverImage =
//       formData.get("coverImage") || "";

//     const imageAlt =
//       formData.get("imageAlt") || "";

//     const categories =
//       getArray(
//         formData,
//         "categories"
//       );

//     const tags =
//       getArray(formData, "tags");

//     const status =
//       formData.get("status") ||
//       "draft";

//     const featured =
//       formData.get("featured") ===
//       "true";

//     const breaking =
//       formData.get("breaking") ===
//       "true";

//     const readTime = Number(
//       formData.get("readTime") || 3
//     );

//     /*
//      * Existing images retained
//      */

//     const existingImagesRaw =
//       formData.get(
//         "existingImages"
//       );

//     let existingImages = [];

//     if (existingImagesRaw) {
//       try {
//         existingImages =
//           JSON.parse(
//             existingImagesRaw
//           );
//       } catch {
//         existingImages = [];
//       }
//     }

//     /*
//      * New images
//      */

//     const imageFiles =
//       formData.getAll("images");

//     const newImages = [];

//     for (const file of imageFiles) {
//       if (
//         !file ||
//         typeof file === "string"
//       ) {
//         continue;
//       }

//       const url =
//         await saveImage(file);

//       if (url) {
//         newImages.push({
//           url,
//           alt: "",
//           caption: "",
//         });
//       }
//     }

//     news.title = title;
//     news.excerpt = excerpt;
//     news.content = content;
//     news.coverImage = coverImage;
//     news.imageAlt = imageAlt;
//     news.categories = categories;
//     news.tags = tags;
//     news.status = status;
//     news.featured = featured;
//     news.breaking = breaking;
//     news.readTime = readTime;

//     news.images = [
//       ...existingImages,
//       ...newImages,
//     ];

//     if (
//       status === "published" &&
//       !news.publishedAt
//     ) {
//       news.publishedAt = new Date();
//     }

//     if (
//       status !== "published"
//     ) {
//       news.publishedAt = null;
//     }

//     await news.save();

//     return NextResponse.json({
//       success: true,
//       data: news,
//     });
//   } catch (error) {
//     console.error(
//       "UPDATE_NEWS_ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           message:
//             error.message ||
//             "Failed to update news.",
//         },
//       },
//       { status: 500 }
//     );
//   }
// }

// export async function DELETE(
//   request,
//   context
// ) {
//   try {
//     await connectDB();

//     const { id } = await context.params;

//     const news =
//       await News.findById(id);

//     if (!news) {
//       return NextResponse.json(
//         {
//           success: false,
//           error: {
//             message:
//               "News not found.",
//           },
//         },
//         { status: 404 }
//       );
//     }

//     await news.deleteOne();

//     return NextResponse.json({
//       success: true,
//       message: "News deleted.",
//     });
//   } catch (error) {
//     console.error(
//       "DELETE_NEWS_ERROR:",
//       error
//     );

//     return NextResponse.json(
//       {
//         success: false,
//         error: {
//           message:
//             "Failed to delete news.",
//         },
//       },
//       { status: 500 }
//     );
//   }
// }



import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import mongoose from "mongoose";

export const runtime = "nodejs";

const ALLOWED_TYPES = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_STATUSES = [
  "draft",
  "scheduled",
  "published",
  "archived",
];

/*
 * =========================================
 * IMAGE UPLOAD
 * =========================================
 */

async function saveImage(file) {
  if (!file || typeof file === "string") {
    return null;
  }

  if (!ALLOWED_TYPES[file.type]) {
    throw new Error(
      "Invalid image type. Use JPG, PNG, WEBP or GIF."
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
 * MONGODB ID VALIDATION
 * =========================================
 */

function isValidObjectId(id) {
  return mongoose.Types.ObjectId.isValid(id);
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
 * GET SINGLE NEWS
 * =========================================
 */

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

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
     * Validate ID before touching MongoDB.
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

    const coverImage = String(
      formData.get("coverImage") ||
        ""
    ).trim();

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

      /*
       * Scheduled article must not
       * already have publishedAt.
       */

      publishedAt = null;
    }

    /*
     * -------------------------------------
     * PUBLISHED
     * -------------------------------------
     */

    if (status === "published") {
      /*
       * If this article was already
       * published, preserve its original
       * publication timestamp.
       *
       * If it was previously draft/
       * scheduled, publish it now.
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
       * record if the article was already
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
     *
     * Only regenerate slug when title
     * actually changes.
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
        const parsed =
          JSON.parse(
            existingImagesValue
          );

        if (
          Array.isArray(parsed)
        ) {
          existingImages =
            parsed
              .filter(
                (image) =>
                  image &&
                  typeof image.url ===
                    "string" &&
                  image.url.trim()
              )
              .map(
                (image) => ({
                  url: image.url,
                  alt:
                    typeof image.alt ===
                    "string"
                      ? image.alt
                      : "",
                  caption:
                    typeof image.caption ===
                    "string"
                      ? image.caption
                      : "",
                })
              );
        }
      } catch (parseError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              message:
                "Invalid existing images data.",
            },
          },
          { status: 400 }
        );
      }
    } else {
      /*
       * If the frontend does not send
       * existingImages, preserve old
       * images instead of deleting them.
       */

      existingImages =
        existingNews.images || [];
    }

    /*
     * =====================================
     * NEW GALLERY IMAGES
     * =====================================
     */

    const imageFiles =
      formData.getAll(
        "images"
      );

    const uploadedImages = [];

    for (
      const file of imageFiles
    ) {
      if (
        !file ||
        typeof file ===
          "string"
      ) {
        continue;
      }

      const url =
        await saveImage(
          file
        );

      if (url) {
        uploadedImages.push({
          url,
          alt: "",
          caption: "",
        });
      }
    }

    /*
     * =====================================
     * COMBINE IMAGES
     * =====================================
     */

    const images = [
      ...existingImages,
      ...uploadedImages,
    ];

    /*
     * =====================================
     * UPDATE
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
     * Save.
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
     * DELETE COVER IMAGE
     * =====================================
     */

    await deleteLocalImage(
      news.coverImage
    );

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
        await deleteLocalImage(
          image?.url
        );
      }
    }

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

/*
 * =========================================
 * DELETE LOCAL IMAGE
 * =========================================
 */

async function deleteLocalImage(
  imageUrl
) {
  try {
    /*
     * Only delete local uploads.
     *
     * This prevents accidentally
     * deleting external URLs.
     */

    if (
      !imageUrl ||
      typeof imageUrl !==
        "string"
    ) {
      return;
    }

    if (
      !imageUrl.startsWith(
        "/uploads/"
      )
    ) {
      return;
    }

    const filename =
      path.basename(
        imageUrl
      );

    const filePath =
      path.join(
        process.cwd(),
        "public",
        "uploads",
        filename
      );

    await fs.unlink(
      filePath
    );
  } catch (error) {
    /*
     * If image was already deleted,
     * don't fail the whole article
     * deletion.
     */

    if (
      error?.code !==
      "ENOENT"
    ) {
      console.error(
        "DELETE_IMAGE_ERROR:",
        error
      );
    }
  }
}