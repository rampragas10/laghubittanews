import "./globals.css";

export const metadata = {
  title: "Laghubitta News",
  description: "लघुवित्त तथा वित्तीय क्षेत्रका ताजा समाचार",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ne">
      <body>{children}</body>
    </html>
  );
}