
import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export default async function NewsPage({ params }) {
  const { slug } = await params;

  await connectDB();

  // ========================================
  // Get published news
  // ========================================
  const news = await News.findOne({
    slug,
    status: "published",
  })
    .populate("categories")
    .lean();

  if (!news) {
    notFound();
  }

  // ========================================
  // Normalize Cover Image
  //
  // New format:
  // {
  //   url: "...",
  //   alt: "..."
  // }
  //
  // Old format:
  // "https://..."
  // ========================================
  let coverImage = {
    url: "",
    alt: news.title,
  };

  if (typeof news.coverImage === "string") {
    coverImage = {
      url: news.coverImage,
      alt: news.imageAlt || news.title,
    };
  } else if (
    news.coverImage &&
    typeof news.coverImage === "object"
  ) {
    coverImage = {
      url: news.coverImage.url || "",
      alt:
        news.coverImage.alt ||
        news.imageAlt ||
        news.title,
    };
  }

  // ========================================
  // Serialize data
  // ========================================
  const serializedNews = {
    ...news,

    _id: news._id.toString(),

    coverImage,

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
        url: image.url || "",
        alt: image.alt || news.title,
        caption: image.caption || "",
      })
    ),

    tags: Array.isArray(news.tags)
      ? news.tags
      : [],
  };

  // ========================================
  // DEBUG
  // Remove later
  // ========================================
  console.log(
    "NEWS SLUG:",
    serializedNews.slug
  );

  console.log(
    "COVER IMAGE:",
    serializedNews.coverImage
  );

  console.log(
    "COVER IMAGE URL:",
    serializedNews.coverImage.url
  );

  // ========================================
  // Page
  // ========================================
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">
        <article className="mx-auto max-w-5xl px-4 py-10 md:px-8">

          {/* =========================
              Categories
          ========================== */}
          {serializedNews.categories.length >
            0 && (
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
          )}

          {/* =========================
              Title
          ========================== */}
          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            {serializedNews.title}
          </h1>

          {/* =========================
              Excerpt
          ========================== */}
          {serializedNews.excerpt && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {serializedNews.excerpt}
            </p>
          )}

          {/* =========================
              Meta
          ========================== */}
          <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">
            {serializedNews.publishedAt && (
              <span>
                {new Intl.DateTimeFormat(
                  "ne-NP",
                  {
                    dateStyle: "medium",
                    timeZone: "Asia/Kathmandu",
                  }
                ).format(
                  new Date(
                    serializedNews.publishedAt
                  )
                )}
              </span>
            )}

            {serializedNews.readTime && (
              <span>
                {serializedNews.readTime} min read
              </span>
            )}

            <span>
              {serializedNews.views || 0} views
            </span>
          </div>

          {/* =========================
              COVER IMAGE
          ========================== */}
          {serializedNews.coverImage.url ? (
            <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">
              <img
                src={serializedNews.coverImage.url}
                alt={
                  serializedNews.coverImage.alt ||
                  serializedNews.title
                }
                className="block h-auto max-h-[650px] w-full object-cover"
              />
            </div>
          ) : (
            <div className="mt-8 flex aspect-video items-center justify-center rounded-xl bg-gray-200 text-gray-500">
              No cover image available
            </div>
          )}

          {/* =========================
              ARTICLE CONTENT
          ========================== */}
          <div
            className="prose prose-lg mt-10 max-w-none"
            dangerouslySetInnerHTML={{
              __html: serializedNews.content,
            }}
          />

          {/* =========================
              GALLERY
          ========================== */}
          {serializedNews.images.length > 0 && (
            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              {serializedNews.images.map(
                (image, index) => {
                  if (!image.url) {
                    return null;
                  }

                  return (
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
                        className="block h-auto w-full object-cover"
                      />

                      {image.caption && (
                        <figcaption className="p-3 text-sm text-gray-500">
                          {image.caption}
                        </figcaption>
                      )}
                    </figure>
                  );
                }
              )}
            </div>
          )}

          {/* =========================
              TAGS
          ========================== */}
          {serializedNews.tags.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-2">
              {serializedNews.tags.map(
                (tag, index) => (
                  <span
                    key={`${tag}-${index}`}
                    className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
                  >
                    #{tag}
                  </span>
                )
              )}
            </div>
          )}

          {/* =========================
              VIEW TRACKING
          ========================== */}
          <ViewTracker
            newsId={serializedNews._id}
          />
        </article>
      </main>

      <Footer />
    </>
  );
}
