export default function NewsArticleSchema({
  news,
  articleUrl,
}) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  // =========================================
  // COVER IMAGE
  // =========================================

  let imageUrl = "";

  if (typeof news.coverImage === "string") {
    imageUrl = news.coverImage;
  } else if (
    news.coverImage &&
    typeof news.coverImage === "object"
  ) {
    imageUrl = news.coverImage.url || "";
  }

  // =========================================
  // DEFAULT IMAGE
  // =========================================

  if (!imageUrl) {
    imageUrl = `${siteUrl}/images/laghubitta.jpg`;
  }

  // =========================================
  // AUTHOR
  // =========================================

  const authorName =
    news.wordpressAuthor?.trim() ||
    "लघुवित्त न्यूज";

  // =========================================
  // SCHEMA
  // =========================================

  const schema = {
    "@context": "https://schema.org",

    "@type": "NewsArticle",

    "@id": `${articleUrl}#newsarticle`,

    url: articleUrl,

    headline: news.title,

    description:
      news.excerpt?.trim() ||
      news.title,

    image: [
      {
        "@type": "ImageObject",
        url: imageUrl,
        width: 1200,
        height: 630,
      },
    ],

    inLanguage: "ne-NP",

    datePublished: news.publishedAt
      ? new Date(
          news.publishedAt
        ).toISOString()
      : undefined,

    dateModified: news.updatedAt
      ? new Date(
          news.updatedAt
        ).toISOString()
      : news.publishedAt
        ? new Date(
            news.publishedAt
          ).toISOString()
        : undefined,

    author: {
      "@type": "Person",
      name: authorName,
    },

    publisher: {
      "@type": "Organization",

      "@id": `${siteUrl}#organization`,

      name: "लघुवित्त न्यूज",

      url: siteUrl,

      logo: {
        "@type": "ImageObject",

        url: `${siteUrl}/images/logo.jpg`,

        width: 512,

        height: 512,
      },
    },

    mainEntityOfPage: {
      "@type": "WebPage",

      "@id": articleUrl,
    },

    isPartOf: {
      "@type": "WebSite",

      "@id": `${siteUrl}#website`,

      name: "लघुवित्त न्यूज",

      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(schema),
      }}
    />
  );
}