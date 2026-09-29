


import { notFound } from "next/navigation";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import ShareButtons from "@/components/ShareButtons";

import { connectDB } from "@/lib/db";
import News from "@/models/News";
import NewsArticleSchema from "@/components/NewsArticleSchema";

export const dynamic = "force-dynamic";

// =====================================================
// WEBSITE URL
// =====================================================
// IMPORTANT:
// Put your real production website URL in .env:
//
// NEXT_PUBLIC_SITE_URL=https://yourdomain.com
//
// For local development you can use:
// NEXT_PUBLIC_SITE_URL=http://localhost:3000
// =====================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

const DEFAULT_OG_IMAGE =
  `${SITE_URL}/images/laghubitta.jpg`;

// =====================================================
// Helper: Get absolute URL
// =====================================================

function getAbsoluteUrl(url) {
  if (!url) {
    return "";
  }

  // Already absolute
  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  // Relative URL
  return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

// =====================================================
// Dynamic SEO + Social Sharing Metadata
// =====================================================


export async function generateMetadata({ params }) {
  const { slug } = await params;

  try {
    await connectDB();

    const news = await News.findOne({
      slug,
      status: "published",
    })
      .select(
        "title slug excerpt coverImage publishedAt updatedAt imageAlt"
      )
      .lean();

    // -----------------------------------------
    // NEWS NOT FOUND
    // -----------------------------------------

    if (!news) {
      return {
        title: "समाचार भेटिएन",
        description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",

        openGraph: {
          title: "समाचार भेटिएन",
          description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",
          type: "website",
          locale: "ne_NP",
          siteName: "लघुवित्त न्यूज",

          images: [
            {
              url: DEFAULT_OG_IMAGE,
              width: 1200,
              height: 630,
              alt: "लघुवित्त न्यूज",
            },
          ],
        },

        twitter: {
          card: "summary_large_image",
          title: "समाचार भेटिएन",
          description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",
          images: [DEFAULT_OG_IMAGE],
        },
      };
    }

    // -----------------------------------------
    // BASIC SEO DATA
    // -----------------------------------------

    const title = news.title;

    const description =
      news.excerpt?.trim() ||
      `${news.title} — लघुवित्त न्यूजमा प्रकाशित समाचार।`;

    // -----------------------------------------
    // ARTICLE URL
    // -----------------------------------------

    const articleUrl =
      `${SITE_URL}/news/${news.slug}`;

    // -----------------------------------------
    // OG IMAGE
    // -----------------------------------------

    /*
      Priority:

      1. News cover image from Cloudinary
      2. /public/images/laghubitta.jpg
    */

    const imageUrl =
      news.coverImage?.url?.trim() ||
      DEFAULT_OG_IMAGE;

    // -----------------------------------------
    // IMAGE ALT
    // -----------------------------------------

    const imageAlt =
      news.coverImage?.alt?.trim() ||
      news.imageAlt?.trim() ||
      news.title;

    // -----------------------------------------
    // RETURN METADATA
    // -----------------------------------------

    return {
      title,

      description,

      alternates: {
        canonical: articleUrl,
      },

      // =======================================
      // OPEN GRAPH
      // =======================================

      openGraph: {
        type: "article",

        locale: "ne_NP",

        url: articleUrl,

        siteName: "लघुवित्त न्यूज",

        title,

        description,

        images: [
          {
            url: imageUrl,

            width: 1200,

            height: 630,

            alt: imageAlt,
          },
        ],

        publishedTime: news.publishedAt
          ? new Date(news.publishedAt).toISOString()
          : undefined,

        modifiedTime: news.updatedAt
          ? new Date(news.updatedAt).toISOString()
          : undefined,
      },

      // =======================================
      // TWITTER / X
      // =======================================

      twitter: {
        card: "summary_large_image",

        title,

        description,

        images: [
          {
            url: imageUrl,

            alt: imageAlt,
          },
        ],
      },
    };
  } catch (error) {
    console.error(
      "generateMetadata error:",
      error
    );

    // =========================================
    // FALLBACK METADATA
    // =========================================

    return {
      title: "लघुवित्त न्यूज",

      description:
        "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

      openGraph: {
        type: "website",

        locale: "ne_NP",

        siteName: "लघुवित्त न्यूज",

        title: "लघुवित्त न्यूज",

        description:
          "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

        images: [
          {
            url: DEFAULT_OG_IMAGE,

            width: 1200,

            height: 630,

            alt: "लघुवित्त न्यूज",
          },
        ],
      },

      twitter: {
        card: "summary_large_image",

        title: "लघुवित्त न्यूज",

        description:
          "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

        images: [DEFAULT_OG_IMAGE],
      },
    };
  }
}

// =====================================================
// NEWS PAGE
// =====================================================

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
  // ========================================

  let coverImage = {
    url: "",
    alt: news.title,
  };

  if (typeof news.coverImage === "string") {
    coverImage = {
      url: news.coverImage,
      alt:
        news.imageAlt ||
        news.title,
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

        alt:
          image.alt ||
          news.title,

        caption:
          image.caption ||
          "",
      })
    ),

    tags: Array.isArray(news.tags)
      ? news.tags
      : [],
  };

  // ========================================
  // Article URL
  // ========================================

  const articleUrl =
    `${SITE_URL}/news/${serializedNews.slug}`;

  // ========================================
  // DEBUG
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
    "ARTICLE URL:",
    articleUrl
  );

  // ========================================
  // PAGE
  // ========================================

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">

        <NewsArticleSchema
  news={serializedNews}
  articleUrl={articleUrl}
/>

        <article className="mx-auto max-w-5xl px-4 py-10 md:px-8">

          {/* =========================
              CATEGORIES
          ========================== */}

          {serializedNews.categories.length > 0 && (
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
              TITLE
          ========================== */}

          <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
            {serializedNews.title}
          </h1>

          {/* =========================
              EXCERPT
          ========================== */}

          {serializedNews.excerpt && (
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {serializedNews.excerpt}
            </p>
          )}

          {/* =========================
              META
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
              SHARE BUTTONS
          ========================== */}

          <ShareButtons
            url={articleUrl}
            title={serializedNews.title}
            description={
              serializedNews.excerpt || ""
            }
          />

          {/* =========================
              COVER IMAGE
          ========================== */}

          {serializedNews.coverImage.url ? (
            <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">

              <img
                src={
                  serializedNews.coverImage.url
                }
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
              __html:
                serializedNews.content,
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
              SHARE BUTTONS - BOTTOM
          ========================== */}

          {/* <ShareButtons
            url={articleUrl}
            title={serializedNews.title}
            description={
              serializedNews.excerpt || ""
            }
          /> */}

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
