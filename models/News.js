import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    excerpt: {
      type: String,
      default: "",
      trim: true,
    },

    content: {
      type: String,
      required: true,
    },

    // ============================================
    // COVER IMAGE
    // ============================================

    coverImage: {
      url: {
        type: String,
        default: "",
        trim: true,
      },

      alt: {
        type: String,
        default: "",
        trim: true,
      },
    },

    // ============================================
    // GALLERY IMAGES
    // ============================================

    images: [
      {
        url: {
          type: String,
          required: true,
        },

        alt: {
          type: String,
          default: "",
        },

        caption: {
          type: String,
          default: "",
        },
      },
    ],

    // ============================================
    // CATEGORIES
    // ============================================

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    // ============================================
    // TAGS
    // ============================================

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // ============================================
    // STATUS
    // ============================================

    status: {
      type: String,
      enum: [
        "draft",
        "scheduled",
        "published",
        "archived",
      ],
      default: "draft",
    },

    // ============================================
    // FLAGS
    // ============================================

    featured: {
      type: Boolean,
      default: false,
    },

    breaking: {
      type: Boolean,
      default: false,
    },

    // ============================================
    // READ TIME
    // ============================================

    readTime: {
      type: Number,
      default: 3,
      min: 1,
    },

    // ============================================
    // VIEWS
    // ============================================

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ============================================
    // SCHEDULE
    // ============================================

    scheduledAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// ============================================
// INDEXES
// ============================================

NewsSchema.index({
  status: 1,
  scheduledAt: 1,
});

NewsSchema.index({
  categories: 1,
  status: 1,
  publishedAt: -1,
});

export default mongoose.models.News ||
  mongoose.model("News", NewsSchema);