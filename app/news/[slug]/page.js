
import {
  notFound,
  permanentRedirect,
} from "next/navigation";

import Image from "next/image";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import ShareButtons from "@/components/ShareButtons";
import AdSlot from "@/components/ads/AdSlot";

import NewsArticleSchema from "@/components/NewsArticleSchema";
import BreadcrumbSchema from "@/components/BreadcrumbSchema";

import { connectDB } from "@/lib/db";

import News from "@/models/News";
import Redirect from "@/models/Redirect";

// =========================================================
// SITE CONFIGURATION
// =========================================================

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "http://localhost:3000";

const SITE_NAME = "लघुवित्त न्यूज";

const DEFAULT_OG_IMAGE =
  `${SITE_URL}/images/laghubitta.jpg`;

// =========================================================
// HELPERS
// =========================================================

function getAbsoluteUrl(url) {
  if (!url) {
    return "";
  }

  if (
    url.startsWith("http://") ||
    url.startsWith("https://")
  ) {
    return url;
  }

  if (url.startsWith("//")) {
    return `https:${url}`;
  }

  if (url.startsWith("/")) {
    return `${SITE_URL}${url}`;
  }

  return `${SITE_URL}/${url}`;
}

function normalizeCoverImage(news) {
  if (!news?.coverImage) {
    return {
      url: DEFAULT_OG_IMAGE,
      alt: news?.title || SITE_NAME,
    };
  }

  // Old string format
  if (
    typeof news.coverImage === "string"
  ) {
    return {
      url: getAbsoluteUrl(news.coverImage),
      alt:
        news.imageAlt ||
        news.title ||
        SITE_NAME,
    };
  }

  // Current object format
  if (
    typeof news.coverImage === "object"
  ) {
    return {
      url:
        getAbsoluteUrl(
          news.coverImage.url
        ) || DEFAULT_OG_IMAGE,

      alt:
        news.coverImage.alt ||
        news.imageAlt ||
        news.title ||
        SITE_NAME,
    };
  }

  return {
    url: DEFAULT_OG_IMAGE,
    alt: news.title || SITE_NAME,
  };
}

async function findNewsRedirect(slug) {
  if (!slug) {
    return null;
  }

  const redirect =
    await Redirect.findOne({
      fromSlug: slug,
    })
      .select(
        "fromSlug toSlug statusCode targetMongoId"
      )
      .lean();

  return redirect;
}

// =========================================================
// SEO METADATA
// =========================================================

export async function generateMetadata({
  params,
}) {
  const { slug } = await params;

  await connectDB();

  const news =
    await News.findOne({
      slug,
      status: "published",
    })
      .populate(
        "categories",
        "name slug"
      )
      .lean();

  if (!news) {
    const redirect =
      await findNewsRedirect(slug);

    if (redirect?.toSlug) {
      permanentRedirect(
        `/news/${redirect.toSlug}`
      );
    }

    return {
      title: `समाचार भेटिएन | ${SITE_NAME}`,

      description:
        "माग गरिएको समाचार उपलब्ध छैन।",

      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const coverImage =
    normalizeCoverImage(news);

  const imageUrl = coverImage.url;

  const description =
    news.excerpt?.trim() ||
    news.title ||
    `${SITE_NAME} मा प्रकाशित समाचार।`;

  const articleUrl =
    `${SITE_URL}/news/${news.slug}`;

  const keywords = Array.isArray(
    news.tags
  )
    ? news.tags
        .map((tag) => {
          if (typeof tag === "string") {
            return tag;
          }

          if (
            tag &&
            typeof tag === "object"
          ) {
            return (
              tag.name ||
              tag.title ||
              ""
            );
          }

          return "";
        })
        .filter(Boolean)
    : [];

  const categories =
    Array.isArray(news.categories)
      ? news.categories
          .map((category) => {
            if (
              typeof category === "string"
            ) {
              return category;
            }

            return (
              category?.name ||
              ""
            );
          })
          .filter(Boolean)
      : [];

  const finalKeywords = [
    ...keywords,
    ...categories,
    "लघुवित्त",
    "लघुवित्त न्यूज",
    "माइक्रोफाइनान्स",
    "नेपाल",
  ];

  const uniqueKeywords = [
    ...new Set(
      finalKeywords.filter(Boolean)
    ),
  ];

  const publishedTime =
    news.publishedAt ||
    news.originalPublishedAt ||
    news.createdAt;

  const modifiedTime =
    news.updatedAt ||
    publishedTime;

  return {
    metadataBase:
      new URL(SITE_URL),

    title: news.title,

    description,

    keywords: uniqueKeywords,

    authors: [
      {
        name:
          news.author?.name ||
          news.wordpressAuthor ||
          SITE_NAME,

        url:
          news.author?.url ||
          SITE_URL,
      },
    ],

    creator:
      news.author?.name ||
      news.wordpressAuthor ||
      SITE_NAME,

    publisher: SITE_NAME,

    alternates: {
      canonical: articleUrl,
    },

    robots: {
      index: true,
      follow: true,

      googleBot: {
        index: true,
        follow: true,

        "max-image-preview":
          "large",

        "max-snippet":
          -1,

        "max-video-preview":
          -1,
      },
    },

    openGraph: {
      type: "article",

      locale: "ne_NP",

      url: articleUrl,

      siteName: SITE_NAME,

      title: news.title,

      description,

      images: [
        {
          url: imageUrl,

          width: 1200,

          height: 675,

          alt:
            coverImage.alt ||
            news.title,
        },
      ],

      publishedTime:
        publishedTime
          ? new Date(
              publishedTime
            ).toISOString()
          : undefined,

      modifiedTime:
        modifiedTime
          ? new Date(
              modifiedTime
            ).toISOString()
          : undefined,

      authors: [
        news.author?.name ||
          news.wordpressAuthor ||
          SITE_NAME,
      ],

      section:
        categories[0] ||
        "समाचार",

      tags: uniqueKeywords,
    },

    twitter: {
      card: "summary_large_image",

      title: news.title,

      description,

      images: [
        {
          url: imageUrl,

          alt:
            coverImage.alt ||
            news.title,
        },
      ],
    },
  };
}

// =========================================================
// ARTICLE PAGE
// =========================================================

export default async function NewsPage({
  params,
}) {
  const { slug } = await params;

  await connectDB();

  // =======================================================
  // FIND PUBLISHED ARTICLE
  // =======================================================

  const news =
    await News.findOne({
      slug,
      status: "published",
    })
      .populate(
        "categories",
        "name slug description"
      )
      .lean();

  // =======================================================
  // ARTICLE DOES NOT EXIST
  // =======================================================

  if (!news) {
    const redirect =
      await findNewsRedirect(slug);

    if (redirect?.toSlug) {
      permanentRedirect(
        `/news/${redirect.toSlug}`
      );
    }

    notFound();
  }

  // =======================================================
  // SERIALIZE COVER IMAGE
  // =======================================================

  const coverImage =
    normalizeCoverImage(news);

  // =======================================================
  // SERIALIZE CATEGORIES
  // =======================================================

  const serializedCategories =
    Array.isArray(news.categories)
      ? news.categories.map(
          (category) => ({
            _id:
              category?._id
                ? String(
                    category._id
                  )
                : null,

            name:
              category?.name || "",

            slug:
              category?.slug || "",

            description:
              category?.description ||
              "",
          })
        )
      : [];

  // =======================================================
  // SERIALIZE GALLERY IMAGES
  // =======================================================

  const serializedImages =
    Array.isArray(news.images)
      ? news.images
          .filter(
            (image) =>
              image &&
              image.url
          )
          .map((image) => ({
            url:
              getAbsoluteUrl(
                image.url
              ),

            alt:
              image.alt ||
              news.title,

            caption:
              image.caption ||
              "",
          }))
      : [];

  // =======================================================
  // SERIALIZE TAGS
  // =======================================================

  const serializedTags =
    Array.isArray(news.tags)
      ? news.tags
          .map((tag) => {
            if (
              typeof tag === "string"
            ) {
              return tag;
            }

            if (
              tag &&
              typeof tag ===
                "object"
            ) {
              return (
                tag.name ||
                tag.title ||
                ""
              );
            }

            return "";
          })
          .filter(Boolean)
      : [];

  // =======================================================
  // SERIALIZED NEWS OBJECT
  // =======================================================

  const serializedNews = {
    ...news,

    _id: news._id
      ? String(news._id)
      : null,

    author: news.author
      ? {
          name:
            news.author.name ||
            SITE_NAME,

          url:
            news.author.url ||
            "",
        }
      : {
          name: SITE_NAME,
          url: "",
        },

    coverImage: {
      url: coverImage.url,

      alt: coverImage.alt,
    },

    images:
      serializedImages,

    categories:
      serializedCategories,

    tags:
      serializedTags,

    createdAt:
      news.createdAt
        ? new Date(
            news.createdAt
          ).toISOString()
        : null,

    updatedAt:
      news.updatedAt
        ? new Date(
            news.updatedAt
          ).toISOString()
        : null,

    publishedAt:
      news.publishedAt
        ? new Date(
            news.publishedAt
          ).toISOString()
        : null,

    originalPublishedAt:
      news.originalPublishedAt
        ? new Date(
            news.originalPublishedAt
          ).toISOString()
        : null,

    scheduledAt:
      news.scheduledAt
        ? new Date(
            news.scheduledAt
          ).toISOString()
        : null,
  };

  // =======================================================
  // ARTICLE URL
  // =======================================================

  const articleUrl =
    `${SITE_URL}/news/${news.slug}`;

  // =======================================================
  // PRIMARY CATEGORY
  // =======================================================

  const primaryCategory =
    serializedCategories[0] || null;

  // =======================================================
  // ARTICLE DESCRIPTION
  // =======================================================

  const articleDescription =
    news.excerpt?.trim() ||
    news.title;

  // =======================================================
  // RENDER PAGE
  // =======================================================

  return (
    <>
      {/* ===================================================
          HEADER
      =================================================== */}

      <Header />

      {/* ===================================================
          VIEW TRACKER
      =================================================== */}

      <ViewTracker
        slug={news.slug}
      />

      {/* ===================================================
          STRUCTURED DATA
      =================================================== */}

      <NewsArticleSchema
        news={serializedNews}
        articleUrl={articleUrl}
      />

      <BreadcrumbSchema
        items={[
          {
            name: "गृहपृष्ठ",
            url: SITE_URL,
          },

          {
            name: "समाचार",
            url: `${SITE_URL}/news`,
          },

          ...(primaryCategory
            ? [
                {
                  name:
                    primaryCategory.name,

                  url:
                    `${SITE_URL}/category/${primaryCategory.slug}`,
                },
              ]
            : []),

          {
            name: news.title,
            url: articleUrl,
          },
        ]}
      />

      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="min-h-screen bg-white">

        {/* =================================================
            NEWS TOP AD
        ================================================= */}

        <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
          <AdSlot
            position="NEWS_TOP"
            className="w-full"
          />
        </div>

        <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">

          {/* =================================================
              BREADCRUMB UI
          ================================================= */}

          <nav
            aria-label="Breadcrumb"
            className="mb-6"
          >
            <ol className="flex flex-wrap items-center gap-2 text-sm text-gray-600">

              <li>
                <a
                  href="/"
                  className="transition hover:text-[#005b37]"
                >
                  गृहपृष्ठ
                </a>
              </li>

              <li
                aria-hidden="true"
                className="text-gray-400"
              >
                /
              </li>

              <li>
                <a
                  href="/news"
                  className="transition hover:text-[#005b37]"
                >
                  समाचार
                </a>
              </li>

              {primaryCategory && (
                <>
                  <li
                    aria-hidden="true"
                    className="text-gray-400"
                  >
                    /
                  </li>

                  <li>
                    <a
                      href={`/category/${primaryCategory.slug}`}
                      className="transition hover:text-[#005b37]"
                    >
                      {
                        primaryCategory.name
                      }
                    </a>
                  </li>
                </>
              )}

            </ol>
          </nav>

          {/* =================================================
              CATEGORY BADGES
          ================================================= */}

          {serializedCategories.length >
            0 && (
            <div className="mb-4 flex flex-wrap gap-2">

              {serializedCategories.map(
                (category) => (
                  <a
                    key={
                      category._id ||
                      category.slug
                    }
                    href={`/category/${category.slug}`}
                    className="rounded-full bg-[#eff4ff] px-3 py-1 text-sm font-medium text-[#005b37] transition hover:bg-[#005b37] hover:text-white"
                  >
                    {category.name}
                  </a>
                )
              )}

            </div>
          )}

          {/* =================================================
              TITLE
          ================================================= */}

          <h1 className="max-w-5xl text-3xl font-bold leading-tight text-gray-900 sm:text-4xl lg:text-5xl">
            {news.title}
          </h1>

          {/* =================================================
              EXCERPT
          ================================================= */}

          {news.excerpt && (
            <p className="mt-5 max-w-4xl text-lg leading-8 text-gray-600 sm:text-xl">
              {news.excerpt}
            </p>
          )}

          {/* =================================================
              ARTICLE META
          ================================================= */}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 border-b border-gray-200 pb-6 text-sm text-gray-500">

            <div>
              <span className="font-medium text-gray-700">
                लेखक:
              </span>{" "}
              {news.author?.name ||
                news.wordpressAuthor ||
                SITE_NAME}
            </div>

            {news.publishedAt && (
              <time
                dateTime={new Date(
                  news.publishedAt
                ).toISOString()}
              >
                प्रकाशित:{" "}
                {new Intl.DateTimeFormat(
                  "ne-NP",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    timeZone:
                      "Asia/Kathmandu",
                  }
                ).format(
                  new Date(
                    news.publishedAt
                  )
                )}
              </time>
            )}

            {news.readTime && (
              <span>
                पढ्न लाग्ने समय:{" "}
                {news.readTime} मिनेट
              </span>
            )}

            {typeof news.views ===
              "number" && (
              <span>
                भ्यु:{" "}
                {news.views.toLocaleString(
                  "ne-NP"
                )}
              </span>
            )}

          </div>

          {/* =================================================
              SHARE BUTTONS
          ================================================= */}

          <div className="mt-5">
            <ShareButtons
              url={articleUrl}
              title={news.title}
              description={
                articleDescription
              }
            />
          </div>

          {/* =================================================
              COVER IMAGE
          ================================================= */}

          {coverImage.url && (
            <figure className="mt-8 overflow-hidden rounded-xl">

              <Image
                src={coverImage.url}
                alt={
                  coverImage.alt ||
                  news.title
                }
                width={1200}
                height={675}
                priority
                className="h-auto w-full object-cover"
                sizes="(max-width: 768px) 100vw, 1024px"
              />

            </figure>
          )}

          {/* =================================================
              NEWS MIDDLE AD
          ================================================= */}

          <div className="my-8">
            <AdSlot
              position="NEWS_MIDDLE"
              className="w-full"
            />
          </div>

          {/* =================================================
              ARTICLE CONTENT
          ================================================= */}

          <div
            className="
              prose
              prose-lg
              mt-10
              max-w-none

              prose-headings:font-bold
              prose-headings:text-gray-900

              prose-p:text-gray-800
              prose-p:leading-8

              prose-a:text-[#005b37]
              prose-a:no-underline
              hover:prose-a:underline

              prose-img:rounded-xl
              prose-img:mx-auto

              prose-blockquote:border-[#005b37]
              prose-blockquote:text-gray-700
            "
            dangerouslySetInnerHTML={{
              __html:
                news.content || "",
            }}
          />

          {/* =================================================
              NEWS BOTTOM AD
          ================================================= */}

          <div className="my-10">
            <AdSlot
              position="NEWS_BOTTOM"
              className="w-full"
            />
          </div>

          {/* =================================================
              IMAGE GALLERY
          ================================================= */}

          {serializedImages.length >
            0 && (
            <section
              aria-label="समाचारका फोटोहरू"
              className="mt-12"
            >

              <h2 className="mb-6 text-2xl font-bold text-gray-900">
                फोटोहरू
              </h2>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">

                {serializedImages.map(
                  (image, index) => (
                    <figure
                      key={`${image.url}-${index}`}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white"
                    >

                      <Image
                        src={image.url}
                        alt={
                          image.alt ||
                          `${news.title} फोटो ${index + 1}`
                        }
                        width={900}
                        height={600}
                        className="h-auto w-full object-cover"
                        sizes="(max-width: 768px) 100vw, 50vw"
                      />

                      {image.caption && (
                        <figcaption className="p-3 text-sm text-gray-600">
                          {
                            image.caption
                          }
                        </figcaption>
                      )}

                    </figure>
                  )
                )}

              </div>

            </section>
          )}

          {/* =================================================
              TAGS
          ================================================= */}

          {serializedTags.length >
            0 && (
            <section
              aria-label="सम्बन्धित ट्यागहरू"
              className="mt-10 border-t border-gray-200 pt-6"
            >

              <h2 className="mb-4 text-lg font-bold text-gray-900">
                ट्यागहरू
              </h2>

              <div className="flex flex-wrap gap-2">

                {serializedTags.map(
                  (tag, index) => (
                    <span
                      key={`${tag}-${index}`}
                      className="rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-700"
                    >
                      #{tag}
                    </span>
                  )
                )}

              </div>

            </section>
          )}

        </article>

      </main>

      {/* =====================================================
          FOOTER
      ===================================================== */}

      <Footer />
    </>
  );
}
