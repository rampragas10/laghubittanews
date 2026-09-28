
export default function NewsArticleSchema({
  news,
  articleUrl,
}) {
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
  // SITE URL
  // =========================================

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  // =========================================
  // SCHEMA
  // =========================================

  const schema = {
    "@context": "https://schema.org",

    "@type": "NewsArticle",

    headline: news.title,

    description:
      news.excerpt || "",

    image: imageUrl
      ? [imageUrl]
      : [],

    datePublished: news.publishedAt
      ? new Date(
          news.publishedAt
        ).toISOString()
      : undefined,

    dateModified: news.updatedAt
      ? new Date(
          news.updatedAt
        ).toISOString()
      : undefined,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    publisher: {
      "@type": "Organization",

      name: "Laghubitta News",

      url: siteUrl,

      logo: {
        "@type": "ImageObject",

        url: `${siteUrl}/images/logo.jpg`,
      },
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
