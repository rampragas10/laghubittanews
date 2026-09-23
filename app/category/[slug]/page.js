
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }) {
  const { slug } = await params;

  await connectDB();

  // Find category
  const category = await Category.findOne({
    slug,
    isActive: true,
  }).lean();

  if (!category) {
    notFound();
  }

  // Find published news belonging to this category
  const news = await News.find({
    categories: category._id,
    status: "published",
  })
    .populate("categories")
    .sort({
      publishedAt: -1,
    })
    .lean();

  // Convert MongoDB objects to plain objects
  const serializedNews = news.map((item) => ({
    ...item,

    _id: item._id.toString(),

    categories: (item.categories || []).map(
      (cat) => ({
        ...cat,
        _id: cat._id.toString(),
      })
    ),
  }));

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <section className="mx-auto max-w-7xl px-4 py-10 md:px-8">

          {/* Category Header */}
          <div className="rounded-lg bg-[#005b37] px-5 py-6 text-white">
            <p className="mb-1 text-sm font-medium uppercase tracking-wide opacity-80">
              Category
            </p>

            <h1 className="text-3xl font-bold">
              {category.name}
            </h1>

            {category.description && (
              <p className="mt-2 max-w-3xl text-sm opacity-80">
                {category.description}
              </p>
            )}
          </div>

          {/* News */}
          {serializedNews.length === 0 ? (
            <div className="mt-6 rounded-lg border border-gray-200 bg-white p-10 text-center">
              <h2 className="text-xl font-semibold text-gray-900">
                कुनै समाचार भेटिएन
              </h2>

              <p className="mt-2 text-gray-500">
                यस श्रेणीमा अहिले प्रकाशित समाचार उपलब्ध छैन।
              </p>
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {serializedNews.map((item) => (
                <NewsCard
                  key={item._id}
                  news={item}
                />
              ))}
            </div>
          )}

        </section>
      </main>

      <Footer />
    </>
  );
}
