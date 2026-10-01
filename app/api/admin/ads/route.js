
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


/**
 * Safely convert a value to a trimmed string.
 */
function stringValue(value) {
  return String(value ?? "").trim();
}


/**
 * Parse an optional date.
 *
 * Returns:
 *   Date   -> valid date
 *   null   -> empty value
 *
 * Throws for invalid dates.
 */
function parseOptionalDate(value, fieldName) {
  const raw = stringValue(value);

  if (!raw) {
    return null;
  }

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date.`);
  }

  return date;
}


/**
 * Validate advertisement position.
 */
function validatePosition(position) {
  if (!AD_POSITIONS.includes(position)) {
    return false;
  }

  return true;
}


/**
 * Validate advertisement status.
 */
function validateStatus(status) {
  if (!AD_STATUSES.includes(status)) {
    return false;
  }

  return true;
}


/**
 * Validate URL.
 *
 * We allow:
 *
 * https://example.com
 * http://example.com
 *
 * We intentionally reject javascript:, data:, etc.
 */
function validateLinkUrl(value) {
  const url = stringValue(value);

  if (!url) {
    return {
      valid: false,
      message: "Advertisement link URL is required.",
    };
  }

  if (url.length > 2048) {
    return {
      valid: false,
      message: "Advertisement link URL is too long.",
    };
  }

  try {
    const parsed = new URL(url);

    if (!["http:", "https:"].includes(parsed.protocol)) {
      return {
        valid: false,
        message:
          "Advertisement link URL must use HTTP or HTTPS.",
      };
    }
  } catch {
    return {
      valid: false,
      message: "Advertisement link URL is invalid.",
    };
  }

  return {
    valid: true,
    value: url,
  };
}


/**
 * Validate image object.
 */
function validateImage(image) {
  if (!image || typeof image !== "object") {
    return {
      valid: false,
      message: "Advertisement image is required.",
    };
  }

  const url = stringValue(image.url);
  const publicId = stringValue(image.publicId);
  const alt = stringValue(image.alt);

  if (!url) {
    return {
      valid: false,
      message: "Advertisement image URL is required.",
    };
  }

  if (url.length > 2048) {
    return {
      valid: false,
      message: "Advertisement image URL is too long.",
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


/**
 * Normalize and validate priority.
 */
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

  if (priority < 0 || priority > 100000) {
    throw new Error(
      "Priority must be between 0 and 100000."
    );
  }

  return priority;
}


/**
 * Validate complete ad input.
 */
function validateAdInput(body) {
  const name = stringValue(body.name);
  const position = stringValue(body.position);
  const status =
    stringValue(body.status) || "inactive";

  const linkUrl = stringValue(body.linkUrl);

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

  const target =
    stringValue(body.target) || "_blank";

  if (!["_blank", "_self"].includes(target)) {
    return {
      valid: false,
      message: "Invalid link target.",
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
 * GET /api/admin/ads
 * =========================================================
 *
 * Returns advertisements for the admin dashboard.
 *
 * Supported query parameters:
 *
 * ?position=HOME_TOP
 * ?status=active
 * ?search=company
 *
 * Example:
 *
 * /api/admin/ads?status=active
 *
 * =========================================================
 */

export async function GET(request) {
  try {
    await connectDB();

    const searchParams =
      request.nextUrl.searchParams;

    const position =
      stringValue(
        searchParams.get("position")
      );

    const status =
      stringValue(
        searchParams.get("status")
      );

    const search =
      stringValue(
        searchParams.get("search")
      );

    const filter = {};

    /*
     * Position filter
     */
    if (position) {
      if (!validatePosition(position)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid advertisement position.",
          },
          { status: 400 }
        );
      }

      filter.position = position;
    }

    /*
     * Status filter
     */
    if (status) {
      if (!validateStatus(status)) {
        return NextResponse.json(
          {
            success: false,
            message:
              "Invalid advertisement status.",
          },
          { status: 400 }
        );
      }

      filter.status = status;
    }

    /*
     * Search
     */
    if (search) {
      filter.name = {
        $regex: search,
        $options: "i",
      };
    }

    const ads = await Ad.find(filter)
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
      .sort({
        priority: -1,
        createdAt: -1,
      })
      .lean();

    const serializedAds = ads.map(
      (ad) => ({
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
      })
    );

    return NextResponse.json(
      {
        success: true,
        data: serializedAds,
        count: serializedAds.length,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      "ADMIN_ADS_GET_ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to fetch advertisements.",
      },
      { status: 500 }
    );
  }
}


/*
 * =========================================================
 * POST /api/admin/ads
 * =========================================================
 *
 * Creates a new advertisement.
 *
 * Expected JSON:
 *
 * {
 *   "name": "Microfinance Banner",
 *   "position": "HOME_TOP",
 *   "image": {
 *     "url": "...",
 *     "publicId": "...",
 *     "alt": "..."
 *   },
 *   "linkUrl": "https://example.com",
 *   "target": "_blank",
 *   "status": "active",
 *   "startAt": null,
 *   "endAt": null,
 *   "priority": 10
 * }
 *
 * =========================================================
 */

export async function POST(request) {
  try {
    await connectDB();

    /*
     * Parse JSON.
     */
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

    /*
     * Validate input.
     */
    const validation =
      validateAdInput(body);

    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          message: validation.message,
        },
        { status: 400 }
      );
    }

    /*
     * Create advertisement.
     */
    const ad = await Ad.create(
      validation.value
    );

    /*
     * Serialize ObjectId.
     */
    const serializedAd = {
      ...ad.toObject(),

      _id: ad._id.toString(),

      createdBy: ad.createdBy
        ? ad.createdBy.toString()
        : null,

      updatedBy: ad.updatedBy
        ? ad.updatedBy.toString()
        : null,
    };

    return NextResponse.json(
      {
        success: true,
        message:
          "Advertisement created successfully.",
        data: serializedAd,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error(
      "ADMIN_ADS_POST_ERROR:",
      error
    );

    /*
     * Mongoose validation error.
     */
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

    /*
     * Invalid ObjectId / cast errors.
     */
    if (
      error?.name === "CastError"
    ) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Invalid advertisement data.",
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        message:
          "Failed to create advertisement.",
      },
      { status: 500 }
    );
  }
}
