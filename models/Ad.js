
import mongoose from "mongoose";

/*
 * =========================================================
 * AD POSITION ENUM
 * =========================================================
 *
 * These are the locations where advertisements can appear
 * throughout the website.
 *
 * Keep these values stable because frontend AdSlot components
 * will depend on them.
 *
 * =========================================================
 */

import { AD_POSITIONS, AD_STATUSES, } from "@/lib/ad-constants";

/*
 * =========================================================
 * AD STATUS
 * =========================================================
 *
 * active:
 *   Admin has enabled the advertisement.
 *
 * inactive:
 *   Advertisement exists but should not be displayed.
 *
 * archived:
 *   Advertisement is no longer intended for normal use.
 *
 * =========================================================
 */



/*
 * =========================================================
 * IMAGE SCHEMA
 * =========================================================
 *
 * We are keeping the Cloudinary structure similar to your
 * existing image architecture.
 *
 * url:
 *   Actual public image URL.
 *
 * publicId:
 *   Cloudinary public ID used for replacement/deletion.
 *
 * alt:
 *   Accessibility + SEO text.
 *
 * =========================================================
 */

const AdImageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
    },

    publicId: {
      type: String,
      default: null,
      trim: true,
    },

    alt: {
      type: String,
      default: "",
      trim: true,
      maxlength: 200,
    },
  },
  {
    _id: false,
  }
);

/*
 * =========================================================
 * AD SCHEMA
 * =========================================================
 */

const AdSchema = new mongoose.Schema(
  {
    /*
     * -----------------------------------------------------
     * BASIC INFORMATION
     * -----------------------------------------------------
     */

    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 150,
    },

    /*
     * -----------------------------------------------------
     * POSITION
     * -----------------------------------------------------
     *
     * Determines where this advertisement appears.
     *
     * Example:
     *
     * HOME_TOP
     * NEWS_MIDDLE
     * SIDEBAR_TOP
     *
     * -----------------------------------------------------
     */

    position: {
      type: String,
      required: true,
      enum: AD_POSITIONS,
      index: true,
    },

    /*
     * -----------------------------------------------------
     * AD IMAGE
     * -----------------------------------------------------
     */

    image: {
      type: AdImageSchema,
      required: true,
    },

    /*
     * -----------------------------------------------------
     * DESTINATION URL
     * -----------------------------------------------------
     *
     * Where the visitor goes after clicking the ad.
     *
     * Example:
     * https://example.com
     *
     * -----------------------------------------------------
     */

    linkUrl: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2048,
    },

    /*
     * -----------------------------------------------------
     * LINK BEHAVIOR
     * -----------------------------------------------------
     *
     * _blank:
     *   Open advertiser website in a new tab.
     *
     * _self:
     *   Open in current tab.
     *
     * For external advertisements, _blank is normally used.
     *
     * -----------------------------------------------------
     */

    target: {
      type: String,
      enum: ["_blank", "_self"],
      default: "_blank",
    },

    /*
     * -----------------------------------------------------
     * STATUS
     * -----------------------------------------------------
     */

    status: {
      type: String,
      enum: AD_STATUSES,
      default: "inactive",
      index: true,
    },

    /*
     * -----------------------------------------------------
     * SCHEDULING
     * -----------------------------------------------------
     *
     * Both fields are optional.
     *
     * startAt:
     *   Advertisement becomes eligible after this time.
     *
     * endAt:
     *   Advertisement stops being eligible after this time.
     *
     * This allows the admin to schedule campaigns in advance.
     *
     * -----------------------------------------------------
     */

    startAt: {
      type: Date,
      default: null,
      index: true,
    },

    endAt: {
      type: Date,
      default: null,
      index: true,
    },

    /*
     * -----------------------------------------------------
     * PRIORITY
     * -----------------------------------------------------
     *
     * Higher priority can be used when multiple ads exist
     * for the same position.
     *
     * Example:
     *
     * Ad A = 100
     * Ad B = 50
     *
     * Ad A gets selected first.
     *
     * -----------------------------------------------------
     */

    priority: {
      type: Number,
      default: 0,
      min: 0,
      max: 100000,
      index: true,
    },

    /*
     * -----------------------------------------------------
     * ANALYTICS
     * -----------------------------------------------------
     *
     * These counters will be updated later by the
     * impression/click tracking system.
     *
     * Stage 1 only defines the database foundation.
     *
     * -----------------------------------------------------
     */

    impressions: {
      type: Number,
      default: 0,
      min: 0,
    },

    clicks: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
     * -----------------------------------------------------
     * ADMIN / AUDIT INFORMATION
     * -----------------------------------------------------
     *
     * These fields allow us to know when the ad was created
     * and last modified.
     *
     * We can connect createdBy / updatedBy to your admin
     * User model later if required.
     *
     * -----------------------------------------------------
     */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

/*
 * =========================================================
 * INDEXES
 * =========================================================
 *
 * These indexes support the queries we will make later.
 *
 * Main frontend query:
 *
 * position + status + priority
 *
 * Scheduling:
 *
 * position + status + startAt + endAt
 *
 * =========================================================
 */

/*
 * Find active ads for a specific position.
 */
AdSchema.index({
  position: 1,
  status: 1,
  priority: -1,
});

/*
 * Support scheduled/active ad selection.
 */
AdSchema.index({
  position: 1,
  status: 1,
  startAt: 1,
  endAt: 1,
});

/*
 * =========================================================
 * VALIDATION
 * =========================================================
 *
 * Prevent an advertisement from having an invalid date range.
 *
 * endAt must be after startAt.
 *
 * =========================================================
 */

AdSchema.pre("validate", function (next) {
  if (this.startAt && this.endAt && this.endAt <= this.startAt) {
    return next(
      new Error("Advertisement endAt must be after startAt.")
    );
  }

  next();
});

/*
 * =========================================================
 * MODEL EXPORT
 * =========================================================
 *
 * Prevent OverwriteModelError during Next.js development
 * hot reloads.
 *
 * =========================================================
 */

const Ad =
  mongoose.models.Ad ||
  mongoose.model("Ad", AdSchema);

export default Ad;
