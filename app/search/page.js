import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export default async function SearchPage({ searchParams }) {
  const params = await searchParams;
  const q = params?.q?.trim() || "";
  await connectDB();
  const filter = q ? { status: "published", $text: { $search: q } } : { status: "published" };
  const news = q ? await News.find(filter).populate("category").sort({ publishedAt: -1 }).limit(30).lean() : [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-8">
        <h1 className="text-2xl font-bold">खोज परिणाम: {q || "..."}</h1>
        <form className="mt-4 flex gap-2">
          <input name="q" defaultValue={q} className="flex-1 rounded-lg border px-4 py-3" placeholder="समाचार खोज्नुहोस्..." />
          <button className="rounded-lg bg-[#005b37] px-5 font-bold text-white">खोज्नुहोस्</button>
        </form>
        <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {news.map((item) => <NewsCard key={item._id} news={item} />)}
        </div>
      </main>
      <Footer />
    </>
  );
}