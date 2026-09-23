import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  await connectDB();
  const category = await Category.findOne({ slug, isActive: true }).lean();
  if (!category) notFound();
  const news = await News.find({ category: category._id, status: "published" })
    .populate("category").sort({ publishedAt: -1 }).lean();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <div className="rounded bg-[#005b37] px-5 py-4 text-white">
          <h1 className="text-2xl font-bold">{category.name}</h1>
          <p className="mt-1 text-sm opacity-80">{category.description}</p>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => <NewsCard key={item._id} news={item} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}