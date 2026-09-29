import mongoose from "mongoose";

const NewsSchema = new mongoose.Schema(
  {


    author: {
  name: {
    type: String,
    default: "लघुवित्त न्यूज",
    trim: true,
  },

  url: {
    type: String,
    default: "",
    trim: true,
  },
},

    // =========================================
    // CORE NEWS DATA
    // =========================================

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
      default: "",
    },

    // =========================================
    // IMAGES
    // =========================================

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

    // =========================================
    // CATEGORIES
    // =========================================

    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
      },
    ],

    // =========================================
    // TAGS
    // =========================================

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    // =========================================
    // PUBLICATION
    // =========================================

    status: {
      type: String,
      enum: ["draft", "scheduled", "published", "archived"],
      default: "draft",
    },

    featured: {
      type: Boolean,
      default: false,
    },

    breaking: {
      type: Boolean,
      default: false,
    },

    readTime: {
      type: Number,
      default: 3,
      min: 1,
    },

    views: {
      type: Number,
      default: 0,
      min: 0,
    },

    scheduledAt: {
      type: Date,
      default: null,
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    // =========================================
    // WORDPRESS MIGRATION METADATA
    // =========================================

    wordpressId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    wordpressUrl: {
      type: String,
      default: "",
      trim: true,
    },

    originalPublishedAt: {
      type: Date,
      default: null,
    },

    wordpressAuthor: {
      type: String,
      default: "",
      trim: true,
    },

    wordpressThumbnailId: {
      type: Number,
      default: null,
    },
  },

  {
    timestamps: true,
  }
);

// =========================================
// INDEXES
// =========================================

// Admin news page:
// newest articles first
NewsSchema.index({
  createdAt: -1,
});

// Admin filtering:
// status + newest articles first
NewsSchema.index({
  status: 1,
  createdAt: -1,
});





// Scheduled news
NewsSchema.index({
  status: 1,
  scheduledAt: 1,
});

// Frontend:
// category + status + newest published articles
NewsSchema.index({
  categories: 1,
  status: 1,
  publishedAt: -1,
});

// WordPress migration lookup
NewsSchema.index({
  wordpressUrl: 1,
});

// =========================================
// MODEL
// =========================================

export default mongoose.models.News ||
  mongoose.model("News", NewsSchema);