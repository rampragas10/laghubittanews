import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export async function getHomeNews() {
  await connectDB();

  const base = {
    status: "published",
  };

  const categories = await Category.find({
    slug: {
      $in: [
        "microfinance-news",
        "microfinance-special",
        "opinion-and-editorial",
        "entrepreneurship",
        "photo-stories",
        "notices-and-vacancy",
        "national-policy",
      ],
    },
    isActive: true,
  }).lean();

  const categoryMap = Object.fromEntries(
    categories.map((category) => [
      category.slug,
      category._id,
    ])
  );

  const [
    featured,
    latest,
    microfinanceNews,
    special,
    opinion,
    entrepreneurship,
    photo,
    notices,
    policy,
  ] = await Promise.all([
    News.find({
      ...base,
      featured: true,
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(1)
      .lean(),

    News.find(base)
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(8)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["microfinance-news"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["microfinance-special"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["opinion-and-editorial"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["entrepreneurship"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["photo-stories"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["notices-and-vacancy"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean(),

    News.find({
      ...base,
      categories: categoryMap["national-policy"],
    })
      .populate("categories")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),
  ]);

  return {
    featured: featured[0] || null,
    latest,
    microfinanceNews,
    special,
    opinion,
    entrepreneurship,
    photo,
    notices,
    policy,
  };
}