
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import ViewTracker from "@/components/ViewTracker";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export default async function NewsPage({ params }) {
  const { slug } = await params;

  await connectDB();

  // IMPORTANT:
  // Only published news is publicly accessible.
  const news = await News.findOne({
    slug,
    status: "published",
  })
    .populate("categories")
    .lean();

  if (!news) {
    notFound();
  }

  const serializedNews = {
    ...news,

    _id: news._id.toString(),

    categories: (news.categories || []).map(
      (category) => ({
        ...category,
        _id: category._id.toString(),
      })
    ),

    images: (news.images || []).map(
      (image) => ({
        ...image,
        _id: image._id
          ? image._id.toString()
          : undefined,
      })
    ),
  };

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <article className="mx-auto max-w-5xl px-4 py-10 md:px-8">

          {/* Categories */}
          <div className="mb-4 flex flex-wrap gap-2">
            {serializedNews.categories.map(
              (category) => (
                <span
                  key={category._id}
                  className="rounded-full bg-[#005b37] px-3 py-1 text-sm font-medium text-white"
                >
                  {category.name}
                </span>
              )
            )}
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            {serializedNews.title}
          </h1>

          {/* Excerpt */}
          {serializedNews.excerpt && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {serializedNews.excerpt}
            </p>
          )}

          {/* Meta */}
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">
            {serializedNews.publishedAt && (
              <span>
                {new Intl.DateTimeFormat("ne-NP", {
                  dateStyle: "medium",
                  timeZone: "Asia/Kathmandu",
                }).format(
                  new Date(
                    serializedNews.publishedAt
                  )
                )}
              </span>
            )}

            <span>
              {serializedNews.readTime} min read
            </span>

            <span>
              {serializedNews.views || 0} views
            </span>
          </div>

          {/* Cover Image */}
          {serializedNews.coverImage && (
            <div className="mt-8 overflow-hidden rounded-xl">
              <img
                src={serializedNews.coverImage}
                alt={
                  serializedNews.imageAlt ||
                  serializedNews.title
                }
                className="h-auto w-full object-cover"
              />
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg mt-10 max-w-none"
            dangerouslySetInnerHTML={{
              __html: serializedNews.content,
            }}
          />

          {/* Gallery */}
          {serializedNews.images.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {serializedNews.images.map(
                (image, index) => (
                  <figure
                    key={
                      image._id ||
                      `${image.url}-${index}`
                    }
                    className="overflow-hidden rounded-lg bg-white"
                  >
                    <img
                      src={image.url}
                      alt={
                        image.alt ||
                        serializedNews.title
                      }
                      className="h-auto w-full object-cover"
                    />

                    {image.caption && (
                      <figcaption className="p-3 text-sm text-gray-500">
                        {image.caption}
                      </figcaption>
                    )}
                  </figure>
                )
              )}
            </div>
          )}

          {/* Tags */}
          {serializedNews.tags?.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {serializedNews.tags.map(
                (tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                  >
                    #{tag}
                  </span>
                )
              )}
            </div>
          )}

          {/* View tracking */}
          <ViewTracker
            newsId={serializedNews._id}
          />
        </article>
      </main>

      <Footer />
    </>
  );
}
