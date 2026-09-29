export default function OrganizationSchema() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000";

  const schema = {
    "@context": "https://schema.org",

    "@type": "Organization",

    "@id": `${siteUrl}#organization`,

    name: "लघुवित्त न्यूज",

    url: siteUrl,

    logo: {
      "@type": "ImageObject",

      url: `${siteUrl}/images/logo.jpg`,
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