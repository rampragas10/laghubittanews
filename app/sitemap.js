import { connectDB } from "@/lib/db";

import News from "@/models/News";
import Category from "@/models/Category";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

export default async function sitemap() {
  await connectDB();

  // =========================================
  // PUBLISHED NEWS
  // =========================================

  const news = await News.find({
    status: "published",
  })
    .select("slug updatedAt publishedAt")
    .sort({
      publishedAt: -1,
    })
    .lean();

  const newsUrls = news.map((item) => ({
    url: `${SITE_URL}/news/${item.slug}`,

    lastModified:
      item.updatedAt ||
      item.publishedAt ||
      undefined,
  }));

  // =========================================
  // ACTIVE CATEGORIES
  // =========================================

  const categories = await Category.find({
    isActive: true,
  })
    .select("slug updatedAt")
    .lean();

  const categoryUrls = categories.map(
    (category) => ({
      url: `${SITE_URL}/category/${category.slug}`,

      lastModified:
        category.updatedAt ||
        undefined,
    })
  );

  // =========================================
  // STATIC URLS
  // =========================================

  return [
    {
      url: SITE_URL,
    },

    {
      url: `${SITE_URL}/news`,
    },

    ...categoryUrls,

    ...newsUrls,
  ];
}

