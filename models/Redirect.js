import mongoose from "mongoose";

const redirectSchema = new mongoose.Schema(
  {
    fromSlug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    toSlug: {
      type: String,
      required: true,
      trim: true,
    },

    statusCode: {
      type: Number,
      enum: [301, 308],
      default: 301,
    },

    sourceMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    targetMongoId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },

    reason: {
      type: String,
      default:
        "EXACT_DUPLICATE_NON_CANONICAL",
    },

    wordpressId: {
      type: Number,
      default: null,
    },

    canonicalWordpressId: {
      type: Number,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);


// =========================================================
// INDEXES
// =========================================================

redirectSchema.index({
  targetMongoId: 1,
});


// =========================================================
// MODEL
// =========================================================

const Redirect =
  mongoose.models.Redirect ||
  mongoose.model(
    "Redirect",
    redirectSchema
  );

export default Redirect;