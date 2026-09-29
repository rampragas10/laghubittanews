export default function WebSiteSchema() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const schema = {
    "@context": "https://schema.org",

    "@type": "WebSite",

    "@id": `${siteUrl}#website`,

    name: "लघुवित्त न्यूज",

    url: siteUrl,

    inLanguage: "ne-NP",

    publisher: {
      "@id": `${siteUrl}#organization`,
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