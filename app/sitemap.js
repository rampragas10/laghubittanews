import { connectDB } from "@/lib/db";
import News from "@/models/News";

export default async function sitemap() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  await connectDB();

  const news = await News.find({
    status: "published",
  })
    .select("slug updatedAt publishedAt")
    .lean();

  const newsUrls = news.map((item) => ({
    url: `${siteUrl}/news/${item.slug}`,

    lastModified:
      item.updatedAt ||
      item.publishedAt ||
      new Date(),

    changeFrequency: "daily",

    priority: 0.8,
  }));

  return [
    {
      url: siteUrl,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 1,
    },

    {
      url: `${siteUrl}/news`,
      lastModified: new Date(),
      changeFrequency: "hourly",
      priority: 0.9,
    },

    ...newsUrls,
  ];
}