export default function NewsArticleSchema({
  news,
  articleUrl,
}) {
  const imageUrl =
    typeof news.coverImage === "string"
      ? news.coverImage
      : news.coverImage?.url || "";

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
      ? new Date(news.publishedAt).toISOString()
      : undefined,

    dateModified: news.updatedAt
      ? new Date(news.updatedAt).toISOString()
      : undefined,

    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },

    publisher: {
      "@type": "Organization",
      name: "Laghubitta News",

      logo: {
        "@type": "ImageObject",
        url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
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