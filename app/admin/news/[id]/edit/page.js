
import { notFound } from "next/navigation";

import AdminShell from "@/components/admin/AdminShell";
import NewsForm from "@/components/admin/NewsForm";

import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

function serializeNews(news) {
  return {
    _id: String(news._id),

    title: news.title || "",
    slug: news.slug || "",

    excerpt: news.excerpt || "",
    content: news.content || "",

    coverImage: news.coverImage || "",
    imageAlt: news.imageAlt || "",

    categories: (news.categories || []).map((category) =>
      String(category._id)
    ),

    tags: Array.isArray(news.tags) ? news.tags : [],

    images: (news.images || []).map((image) => ({
      url: image.url || "",
      alt: image.alt || "",
      caption: image.caption || "",
    })),

    status: news.status || "draft",

    featured: Boolean(news.featured),
    breaking: Boolean(news.breaking),

    readTime: news.readTime || 3,
    views: news.views || 0,

    publishedAt: news.publishedAt
      ? news.publishedAt.toISOString()
      : null,

    scheduledAt: news.scheduledAt
      ? news.scheduledAt.toISOString()
      : null,
  };
}

export default async function EditNewsPage({ params }) {
  // Next.js 16: params is a Promise
  const { id } = await params;

  // Connect MongoDB
  await connectDB();

  // Find the news article
  const news = await News.findById(id)
    .populate("categories")
    .lean();

  // If article doesn't exist
  if (!news) {
    notFound();
  }

  // Get active categories
  const categories = await Category.find({
    isActive: true,
  })
    .sort({ name: 1 })
    .lean();

  // Convert MongoDB data into client-safe data
  const initial = serializeNews(news);

  // Convert categories into plain objects
  const categoryOptions = categories.map((category) => ({
    _id: String(category._id),
    name: category.name,
    slug: category.slug,
    description: category.description || "",
    isActive: Boolean(category.isActive),
  }));

  return (
    <AdminShell title="Edit News">
      <NewsForm
        initial={initial}
        categories={categoryOptions}
      />
    </AdminShell>
  );
}
