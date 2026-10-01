
import { NextResponse } from "next/server";

import mongoose from "mongoose";

import { connectDB } from "@/lib/db";
import Ad from "@/models/Ad";
import { AD_POSITIONS, AD_STATUSES, } from "@/lib/ad-constants";


/*
 * =========================================================
 * HELPERS
 * =========================================================
 */

function stringValue(value) {
  return String(value ?? "").trim();
}


function isValidId(id) {
  return mongoose.Types.ObjectId.isValid(id);
}


function parseOptionalDate(value, fieldName) {
  const raw = stringValue(value);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(
      `${fieldName} must be a valid date.`
    );
  }

  return date;
}


function validatePosition(position) {
  return AD_POSITIONS.includes(
    position
  );
}


function validateStatus(status) {
  return AD_STATUSES.includes(
    status
  );
}


function validateLinkUrl(value) {
  const url = stringValue(value);

  if (!url) {
    return {
      valid: false,
      message:
        "Advertisement link URL is required.",
    };
  }

  try {
    const parsed = new URL(url);

    if (
      !["http:", "https:"].includes(
        parsed.protocol
      )
    ) {
      return {
        valid: false,
        message:
          "Advertisement URL must use HTTP or HTTPS.",
      };
    }
  } catch {
    return {
      valid: false,
      message:
        "Advertisement link URL is invalid.",
    };
  }

  return {
    valid: true,
    value: url,
  };
}


function validateImage(image) {
  if (
    !image ||
    typeof image !== "object"
  ) {
    return {
      valid: false,
      message:
        "Advertisement image is required.",
    };
  }

  const url = stringValue(image.url);
  const publicId =
    stringValue(image.publicId);
  const alt =
    stringValue(image.alt);

  if (!url) {
    return {
      valid: false,
      message:
        "Advertisement image URL is required.",
    };
  }

  return {
    valid: true,

    value: {
      url,
      publicId: publicId || null,
      alt: alt.slice(0, 200),
    },
  };
}


function parsePriority(value) {
  if (
    value === undefined ||
    value === null ||
    value === ""
  ) {
    return 0;
  }

  const priority = Number(value);

  if (!Number.isInteger(priority)) {
    throw new Error(
      "Priority must be a whole number."
    );
  }

  if (
    priority < 0 ||
    priority > 100000
  ) {
    throw new Error(
      "Priority must be between 0 and 100000."
    );
  }

  return priority;
}


/*
 * =========================================================
 * BUILD UPDATE DATA
 * =========================================================
 *
 * We explicitly whitelist editable fields.
 *
 * This is important.
 *
 * The client cannot send:
 *
 * {
 *   "clicks": 999999
 * }
 *
 * and modify analytics.
 *
 * It also cannot modify createdAt, createdBy, etc.
 *
 * =========================================================
 */

function validateUpdate(body) {
  const name =
    stringValue(body.name);

  const position =
    stringValue(body.position);

  const status =
    stringValue(body.status);

  const linkUrl =
    stringValue(body.linkUrl);

  const target =
    stringValue(body.target);

  if (name.length < 2) {
    return {
      valid: false,
      message:
        "Advertisement name must contain at least 2 characters.",
    };
  }

  if (name.length > 150) {
    return {
      valid: false,
      message:
        "Advertisement name cannot exceed 150 characters.",
    };
  }

  if (!validatePosition(position)) {
    return {
      valid: false,
      message:
        "Invalid advertisement position.",
    };
  }

  if (!validateStatus(status)) {
    return {
      valid: false,
      message:
        "Invalid advertisement status.",
    };
  }

  const validatedUrl =
    validateLinkUrl(linkUrl);

  if (!validatedUrl.valid) {
    return validatedUrl;
  }

  const validatedImage =
    validateImage(body.image);

  if (!validatedImage.valid) {
    return validatedImage;
  }

  if (
    !["_blank", "_self"].includes(
      target
    )
  ) {
    return {
      valid: false,
      message:
        "Invalid link target.",
    };
  }

  let startAt;
  let endAt;

  try {
    startAt = parseOptionalDate(
      body.startAt,
      "startAt"
    );

    endAt = parseOptionalDate(
      body.endAt,
      "endAt"
    );
  } catch (error) {
    return {
      valid: false,
      message: error.message,
    };
  }

  if (
    startAt &&
    endAt &&
    endAt <= startAt
  ) {
    return {
      valid: false,
      message:
        "End date must be after start date.",
    };
  }

  let priority;

  try {
    priority = parsePriority(
      body.priority
    );
  } catch (error) {
    return {
      valid: false,
      message: error.message,
    };
  }

  return {
    valid: true,

    value: {
      name,
      position,
      status,
      image: validatedImage.value,
      linkUrl: validatedUrl.value,
      target,
      startAt,
      endAt,
      priority,
    },
  };
}


/*
 * =========================================================
 * GET /api/admin/ads/:id
 * =========================================================
 */

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid advertisement ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const ad = await Ad.findById(id)
      .select(
        [
          "name",
          "position",
          "image",
          "linkUrl",
          "target",
          "status",
          "startAt",
          "endAt",
          "priority",
          "impressions",
          "clicks",
          "createdBy",
          "updatedBy",
          "createdAt",
          "updatedAt",
        ].join(" ")
      )
      .lean();

    if (!ad) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Advertisement not found.",
        },
        { status: 404 }
      );
    }

    const serializedAd = {
      ...ad,

      _id: ad._id.toString(),

      createdBy:
        ad.createdBy
          ? ad.createdBy.toString()
          : null,

      updatedBy:
        ad.updatedBy
          ? ad.updatedBy.toString()
          : null,
    };

    return NextResponse.json(
      {
        success: true,
        data: serializedAd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN_AD_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch advertisement.",
      },
      { status: 500 }
    );
  }
}


/*
 * =========================================================
 * PUT /api/admin/ads/:id
 * =========================================================
 */

export async function PUT(
  request,
  { params }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid advertisement ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    let body;

    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          message:
            "Request body must be valid JSON.",
        },
        { status: 400 }
      );
    }

    const validation =
      validateUpdate(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
        },
        { status: 400 }
      );
    }

    const existingAd =
      await Ad.findById(id);

    if (!existingAd) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Advertisement not found.",
        },
        { status: 404 }
      );
    }

    /*
     * Explicitly update only approved fields.
     */
    existingAd.name =
      validation.value.name;

    existingAd.position =
      validation.value.position;

    existingAd.status =
      validation.value.status;

    existingAd.image =
      validation.value.image;

    existingAd.linkUrl =
      validation.value.linkUrl;

    existingAd.target =
      validation.value.target;

    existingAd.startAt =
      validation.value.startAt;

    existingAd.endAt =
      validation.value.endAt;

    existingAd.priority =
      validation.value.priority;

    await existingAd.save();

    const serializedAd = {
      ...existingAd.toObject(),

      _id:
        existingAd._id.toString(),

      createdBy:
        existingAd.createdBy
          ? existingAd.createdBy.toString()
          : null,

      updatedBy:
        existingAd.updatedBy
          ? existingAd.updatedBy.toString()
          : null,
    };

    return NextResponse.json(
      {
        success: true,
        message:
          "Advertisement updated successfully.",
        data: serializedAd,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN_AD_PUT_ERROR:",
      error
    );

    if (
      error?.name ===
      "ValidationError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Advertisement validation failed.",
          errors: Object.fromEntries(
            Object.entries(
              error.errors || {}
            ).map(
              ([field, details]) => [
                field,
                details.message,
              ]
            )
          ),
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to update advertisement.",
      },
      { status: 500 }
    );
  }
}


/*
 * =========================================================
 * DELETE /api/admin/ads/:id
 * =========================================================
 *
 * Permanent deletion.
 *
 * IMPORTANT:
 *
 * We do NOT delete the Cloudinary image here yet.
 *
 * Stage 4 will handle Cloudinary cleanup safely.
 *
 * =========================================================
 */

export async function DELETE(
  request,
  { params }
) {
  try {
    const { id } = await params;

    if (!isValidId(id)) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid advertisement ID.",
        },
        { status: 400 }
      );
    }

    await connectDB();

    const ad =
      await Ad.findById(id);

    if (!ad) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Advertisement not found.",
        },
        { status: 404 }
      );
    }

    await Ad.deleteOne({
      _id: id,
    });

    return NextResponse.json(
      {
        success: true,
        message:
          "Advertisement deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN_AD_DELETE_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to delete advertisement.",
      },
      { status: 500 }
    );
  }
}
