// import { connectDB } from "./db";
// import News from "@/models/News";

// export async function getHomeNews() {
//   await connectDB();
//   const base = { status: "published" };
//   const [featured, latest, special, opinion, entrepreneurship, photo, notices, policy] =
//     await Promise.all([
//       News.findOne({ ...base, featured: true }).populate("category").sort({ publishedAt: -1 }).lean(),
//       News.find(base).populate("category").sort({ publishedAt: -1 }).limit(8).lean(),
//       News.find({ ...base, "category.slug": "microfinance-special" }).populate("category").sort({ publishedAt: -1 }).limit(4).lean(),
//       News.find({ ...base, "category.slug": "opinion-and-editorial" }).populate("category").sort({ publishedAt: -1 }).limit(4).lean(),
//       News.find({ ...base, "category.slug": "entrepreneurship" }).populate("category").sort({ publishedAt: -1 }).limit(4).lean(),
//       News.find({ ...base, "category.slug": "photo-stories" }).populate("category").sort({ publishedAt: -1 }).limit(4).lean(),
//       News.find({ ...base, "category.slug": "notices-and-vacancy" }).populate("category").sort({ publishedAt: -1 }).limit(6).lean(),
//       News.find({ ...base, "category.slug": "national-policy" }).populate("category").sort({ publishedAt: -1 }).limit(4).lean()
//     ]);
//   return { featured, latest, special, opinion, entrepreneurship, photo, notices, policy };
// }


import { connectDB } from "./db";

import News from "@/models/News";
import Category from "@/models/Category";

export async function getHomeNews() {
  await connectDB();

  const base = {
    status: "published",
  };

  // Get all categories needed by the homepage
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

  // Convert categories into:
  //
  // {
  //   "microfinance-news": ObjectId(...),
  //   "microfinance-special": ObjectId(...),
  //   ...
  // }
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
    // Featured
    News.findOne({
      ...base,
      featured: true,
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .lean(),

    // Latest
    News.find(base)
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(8)
      .lean(),

    // Microfinance News
    News.find({
      ...base,
      category: categoryMap["microfinance-news"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean(),

    // Microfinance Special
    News.find({
      ...base,
      category: categoryMap["microfinance-special"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    // Opinion
    News.find({
      ...base,
      category: categoryMap["opinion-and-editorial"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    // Entrepreneurship
    News.find({
      ...base,
      category: categoryMap["entrepreneurship"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    // Photo Stories
    News.find({
      ...base,
      category: categoryMap["photo-stories"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),

    // Notices
    News.find({
      ...base,
      category: categoryMap["notices-and-vacancy"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(6)
      .lean(),

    // National Policy
    News.find({
      ...base,
      category: categoryMap["national-policy"],
    })
      .populate("category")
      .sort({ publishedAt: -1 })
      .limit(4)
      .lean(),
  ]);

  return {
    featured,
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