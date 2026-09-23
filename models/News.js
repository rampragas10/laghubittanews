
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

    coverImage: {
      type: String,
      default: "",
    },

    imageAlt: {
      type: String,
      default: "",
      trim: true,
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

    // Multiple categories
    categories: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        required: true,
      },
    ],

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

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
  },
  {
    timestamps: true,
  }
);

// Important for scheduled publishing
NewsSchema.index({
  status: 1,
  scheduledAt: 1,
});

// Useful for category pages
NewsSchema.index({
  categories: 1,
  status: 1,
  publishedAt: -1,
});

export default mongoose.models.News ||
  mongoose.model("News", NewsSchema);
