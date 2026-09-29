import "./globals.css";

export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ),

  title: {
    default: "लघुवित्त न्यूज",
    template: "%s | लघुवित्त न्यूज",
  },

  description:
    "लघुवित्त, बैंकिङ, अर्थतन्त्र, वित्तीय क्षेत्र तथा समसामयिक विषयका विश्वसनीय समाचार।",

  keywords: [
    "लघुवित्त",
    "लघुवित्त न्यूज",
    "microfinance news Nepal",
    "नेपाल लघुवित्त",
    "बैंकिङ समाचार",
    "अर्थतन्त्र",
    "वित्तीय समाचार",
  ],

  openGraph: {
    type: "website",
    locale: "ne_NP",
    url: "/",
    siteName: "लघुवित्त न्यूज",

    title: "लघुवित्त न्यूज",

    description:
      "लघुवित्त, बैंकिङ, अर्थतन्त्र, वित्तीय क्षेत्र तथा समसामयिक विषयका विश्वसनीय समाचार।",

    images: [
      {
        url: "/images/og-image.jpg",
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
      "लघुवित्त, बैंकिङ, अर्थतन्त्र, वित्तीय क्षेत्र तथा समसामयिक विषयका विश्वसनीय समाचार।",

    images: ["/images/og-image.jpg"],
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <body>{children}</body>
    </html>
  );
}