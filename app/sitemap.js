
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";


const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.laghubittanews.com";


export default async function sitemap() {
  await connectDB();


  // =====================================================
  // STATIC PAGES
  // =====================================================

  const staticPages = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },

    {
      url: `${SITE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
  ];


  // =====================================================
  // NEWS
  // =====================================================

  const news = await News.find({
    status: "published",
    slug: {
      $exists: true,
      $ne: "",
    },
  })
    .select("slug updatedAt publishedAt")
    .lean();


  const newsUrls = news.map((item) => ({
    url: `${SITE_URL}/news/${item.slug}`,

    lastModified:
      item.updatedAt ||
      item.publishedAt ||
      new Date(),

    changeFrequency: "weekly",

    priority: 0.8,
  }));


  // =====================================================
  // CATEGORIES
  // =====================================================

  const categories = await Category.find({
    isActive: true,

    slug: {
      $exists: true,
      $ne: "",
    },
  })
    .select("slug updatedAt")
    .lean();


  const categoryUrls = categories.map((category) => ({
    url: `${SITE_URL}/category/${category.slug}`,

    lastModified:
      category.updatedAt || new Date(),

    changeFrequency: "daily",

    priority: 0.7,
  }));


  // =====================================================
  // RETURN
  // =====================================================

  return [
    ...staticPages,
    ...categoryUrls,
    ...newsUrls,
  ];
}
