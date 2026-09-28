import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ||
      "http://localhost:3000"
  ),

  title: {
    default:
      "Laghubitta News | लघुवित्त संस्थाका ग्राहकको हित संरक्षणका लागि भएका व्यवस्थाहरु",
    template: "%s | Laghubitta News",
  },

  description:
    "लघुवित्त न्यूज/ नेपाल राष्ट्र बैंकले लघुवित्त वित्तीय संस्थाका ग्राहकको हित संरक्षणका लागि विभिन्न व्यवस्था कायम गरेको छ। केन्द्रीय बैंकले गत पुस २३ गते लघुवित्त वित्तीय संस्था सञ्चालन मार्गदर्शन, २०८१ जारी गरेको थियो। सोही मार्गदर्शनमार्फत राष्ट्र लघुवित्त संस्थाका ग्राहकको हित संरक्षणका लागि विभिन्न व्यवस्था कायम गरेको हो।",

  keywords: [
    "लघुवित्त",
    "लघुवित्त समाचार",
    "microfinance news",
    "नेपाल लघुवित्त",
    "बैंकिङ समाचार",
    "वित्तीय समाचार",
    "अर्थतन्त्र",
    "Nepal finance news",
  ],

  authors: [
    {
      name: "Laghubitta News",
    },
  ],

  creator: "Laghubitta News",

  publisher: "Laghubitta News",

  robots: {
    index: true,
    follow: true,

    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },

  openGraph: {
    type: "website",
    locale: "ne_NP",
    url: "https://yourdomain.com",
    siteName: "Laghubitta News | लघुवित्त तथा वित्तीय समाचार",
    title:
      "Laghubitta News | लघुवित्त तथा वित्तीय समाचार",
    description:
      "लघुवित्त न्यूज/ नेपाल राष्ट्र बैंकले लघुवित्त वित्तीय संस्थाका ग्राहकको हित संरक्षणका लागि विभिन्न व्यवस्था कायम गरेको छ। केन्द्रीय बैंकले गत पुस २३ गते लघुवित्त वित्तीय संस्था सञ्चालन मार्गदर्शन, २०८१ जारी गरेको थियो। सोही मार्गदर्शनमार्फत राष्ट्र लघुवित्त संस्थाका ग्राहकको हित संरक्षणका लागि विभिन्न व्यवस्था कायम गरेको हो।",
    image: [
      {
        url: "../../../public/images/laghubitta.jpg",
        width: 800,
        height: 600,
        alt: "Laghubitta News Logo",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title:
      "Laghubitta News | लघुवित्त तथा वित्तीय समाचार",
    description:
      "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका पछिल्ला समाचार।",
      images: ["../../../public/images/laghubitta.jpg"],
  },

  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <body>{children}</body>
    </html>
  );
}
