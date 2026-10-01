
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://www.laghubittanews.com";


export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",

        allow: "/",

        disallow: [
          "/admin/",
          "/api/",
          "/login/",
        ],
      },
    ],

    sitemap: `${SITE_URL}/sitemap.xml`,

    host: SITE_URL,
  };
}
