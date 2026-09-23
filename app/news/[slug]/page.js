import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function NewsDetail({ params }) {
  const { slug } = await params;
  await connectDB();
  const news = await News.findOne({ slug, status: "published" }).populate("category").lean();
  if (!news) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 md:px-8">
        <div className="text-sm font-bold text-[#005b37]">{news.category?.name}</div>
        <h1 className="mt-2 text-3xl font-bold leading-tight md:text-5xl">{news.title}</h1>
        <div className="mt-3 text-sm text-gray-500">
          {new Date(news.publishedAt || news.createdAt).toLocaleString("ne-NP")} · {news.views} views · {news.readTime} min read
        </div>
        {news.coverImage && <img src={news.coverImage} alt={news.imageAlt || news.title} className="mt-8 max-h-[600px] w-full rounded-xl object-cover" />}
        {news.excerpt && <p className="mt-8 text-lg font-medium leading-8 text-gray-700">{news.excerpt}</p>}
        <div className="prose-news mt-8" dangerouslySetInnerHTML={{ __html: news.content }} />
      </main>
      <Footer />
    </>
  );
}