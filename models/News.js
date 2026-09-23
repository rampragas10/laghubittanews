import mongoose from "mongoose";
import Category from "./Category.js";

const NewsSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true },
    excerpt: { type: String, default: "" },
    content: { type: String, required: true },
    coverImage: { type: String, default: "" },
    imageAlt: { type: String, default: "" },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true }],
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
      index: true
    },
    featured: { type: Boolean, default: false },
    breaking: { type: Boolean, default: false },
    readTime: { type: Number, default: 3 },
    views: { type: Number, default: 0 },
    publishedAt: { type: Date, default: null },
    authorName: { type: String, default: "Laghubitta News" }
  },
  { timestamps: true }
);

NewsSchema.index({ title: "text", excerpt: "text", content: "text", tags: "text" });
NewsSchema.index({ status: 1, category: 1, publishedAt: -1 });

export default mongoose.models.News || mongoose.model("News", NewsSchema);