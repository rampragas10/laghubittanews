


// // import { notFound } from "next/navigation";
// // import Image from "next/image";

// // import Header from "@/components/Header";
// // import Footer from "@/components/Footer";
// // import ViewTracker from "@/components/ViewTracker";
// // import ShareButtons from "@/components/ShareButtons";

// // import { connectDB } from "@/lib/db";
// // import News from "@/models/News";
// // import NewsArticleSchema from "@/components/NewsArticleSchema";
// // import BreadcrumbSchema from "@/components/BreadcrumbSchema";

// // export const dynamic = "force-dynamic";

// // // =====================================================
// // // WEBSITE URL
// // // =====================================================
// // // IMPORTANT:
// // // Put your real production website URL in .env:
// // //
// // // NEXT_PUBLIC_SITE_URL=https://yourdomain.com
// // //
// // // For local development you can use:
// // // NEXT_PUBLIC_SITE_URL=http://localhost:3000
// // // =====================================================

// // const SITE_URL =
// //   process.env.NEXT_PUBLIC_SITE_URL ||
// //   "http://localhost:3000";

// // const DEFAULT_OG_IMAGE =
// //   `${SITE_URL}/images/laghubitta.jpg`;

// // // =====================================================
// // // Helper: Get absolute URL
// // // =====================================================

// // function getAbsoluteUrl(url) {
// //   if (!url) {
// //     return "";
// //   }

// //   // Already absolute
// //  if (
// //   url.startsWith("http://") ||
// //   url.startsWith("https://")
// // ) {
// //   return url;
// // }

// //   // Relative URL
// //   return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
// // }

// // // =====================================================
// // // Dynamic SEO + Social Sharing Metadata
// // // =====================================================


// // // export async function generateMetadata({ params }) {
// // //   const { slug } = await params;

// // //   try {
// // //     await connectDB();

// // //     const news = await News.findOne({
// // //       slug,
// // //       status: "published",
// // //     })
// // //       .select(
// // //         "title slug excerpt coverImage publishedAt updatedAt imageAlt"
// // //       )
// // //       .lean();

// // //     // -----------------------------------------
// // //     // NEWS NOT FOUND
// // //     // -----------------------------------------

// // //     if (!news) {
// // //       return {
// // //         title: "समाचार भेटिएन",
// // //         description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",

// // //         openGraph: {
// // //           title: "समाचार भेटिएन",
// // //           description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",
// // //           type: "website",
// // //           locale: "ne_NP",
// // //           siteName: "लघुवित्त न्यूज",

// // //           images: [
// // //             {
// // //               url: DEFAULT_OG_IMAGE,
// // //               width: 1200,
// // //               height: 630,
// // //               alt: "लघुवित्त न्यूज",
// // //             },
// // //           ],
// // //         },

// // //         twitter: {
// // //           card: "summary_large_image",
// // //           title: "समाचार भेटिएन",
// // //           description: "तपाईंले खोज्नुभएको समाचार भेटिएन।",
// // //           images: [DEFAULT_OG_IMAGE],
// // //         },
// // //       };
// // //     }

// // //     // -----------------------------------------
// // //     // BASIC SEO DATA
// // //     // -----------------------------------------

// // //     const title = news.title;

// // //     const description =
// // //       news.excerpt?.trim() ||
// // //       `${news.title} — लघुवित्त न्यूजमा प्रकाशित समाचार।`;

// // //     // -----------------------------------------
// // //     // ARTICLE URL
// // //     // -----------------------------------------

// // //     const articleUrl =
// // //       `${SITE_URL}/news/${news.slug}`;

// // //     // -----------------------------------------
// // //     // OG IMAGE
// // //     // -----------------------------------------

// // //     /*
// // //       Priority:

// // //       1. News cover image from Cloudinary
// // //       2. /public/images/laghubitta.jpg
// // //     */

// // //     const imageUrl =
// // //       news.coverImage?.url?.trim() ||
// // //       DEFAULT_OG_IMAGE;

// // //     // -----------------------------------------
// // //     // IMAGE ALT
// // //     // -----------------------------------------

// // //     const imageAlt =
// // //       news.coverImage?.alt?.trim() ||
// // //       news.imageAlt?.trim() ||
// // //       news.title;

// // //     // -----------------------------------------
// // //     // RETURN METADATA
// // //     // -----------------------------------------

// // //     return {
// // //       title,

// // //       description,

// // //       alternates: {
// // //         canonical: articleUrl,
// // //       },

// // //       // =======================================
// // //       // OPEN GRAPH
// // //       // =======================================

// // //       openGraph: {
// // //         type: "article",

// // //         locale: "ne_NP",

// // //         url: articleUrl,

// // //         siteName: "लघुवित्त न्यूज",

// // //         title,

// // //         description,

// // //         images: [
// // //           {
// // //             url: imageUrl,

// // //             width: 1200,

// // //             height: 630,

// // //             alt: imageAlt,
// // //           },
// // //         ],

// // //         publishedTime: news.publishedAt
// // //           ? new Date(news.publishedAt).toISOString()
// // //           : undefined,

// // //         modifiedTime: news.updatedAt
// // //           ? new Date(news.updatedAt).toISOString()
// // //           : undefined,
// // //       },

// // //       // =======================================
// // //       // TWITTER / X
// // //       // =======================================

// // //       twitter: {
// // //         card: "summary_large_image",

// // //         title,

// // //         description,

// // //         images: [
// // //           {
// // //             url: imageUrl,

// // //             alt: imageAlt,
// // //           },
// // //         ],
// // //       },
// // //     };
// // //   } catch (error) {
// // //     console.error(
// // //       "generateMetadata error:",
// // //       error
// // //     );

// // //     // =========================================
// // //     // FALLBACK METADATA
// // //     // =========================================

// // //     return {
// // //       title: "लघुवित्त न्यूज",

// // //       description:
// // //         "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

// // //       openGraph: {
// // //         type: "website",

// // //         locale: "ne_NP",

// // //         siteName: "लघुवित्त न्यूज",

// // //         title: "लघुवित्त न्यूज",

// // //         description:
// // //           "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

// // //         images: [
// // //           {
// // //             url: DEFAULT_OG_IMAGE,

// // //             width: 1200,

// // //             height: 630,

// // //             alt: "लघुवित्त न्यूज",
// // //           },
// // //         ],
// // //       },

// // //       twitter: {
// // //         card: "summary_large_image",

// // //         title: "लघुवित्त न्यूज",

// // //         description:
// // //           "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

// // //         images: [DEFAULT_OG_IMAGE],
// // //       },
// // //     };
// // //   }
// // // }



// // export async function generateMetadata({ params }) {
// //   const { slug } = await params;

// //   try {
// //     await connectDB();

// //     const news = await News.findOne({
// //       slug,
// //       status: "published",
// //     })
// //       .select(
// //         "title slug excerpt coverImage publishedAt updatedAt imageAlt"
// //       )
// //       .lean();

// //     if (!news) {
// //       return {
// //         title: "समाचार भेटिएन",
// //         description:
// //           "तपाईंले खोज्नुभएको समाचार भेटिएन।",

// //         robots: {
// //           index: false,
// //           follow: false,
// //         },
// //       };
// //     }

// //     const title = news.title?.trim() || "लघुवित्त न्यूज";

// //     const description =
// //       news.excerpt?.trim() ||
// //       `${title} — लघुवित्त न्यूजमा प्रकाशित समाचार।`;

// //     const articleUrl =
// //       `${SITE_URL}/news/${news.slug}`;

// //     const imageUrl =
// //       news.coverImage?.url?.trim() ||
// //       DEFAULT_OG_IMAGE;

// //     const imageAlt =
// //       news.coverImage?.alt?.trim() ||
// //       news.imageAlt?.trim() ||
// //       title;

// //     return {
// //       title,

// //       description,

// //       alternates: {
// //         canonical: articleUrl,
// //       },

// //       robots: {
// //         index: true,
// //         follow: true,

// //         googleBot: {
// //           index: true,
// //           follow: true,
// //           "max-image-preview": "large",
// //           "max-snippet": -1,
// //           "max-video-preview": -1,
// //         },
// //       },

// //       openGraph: {
// //         type: "article",

// //         locale: "ne_NP",

// //         url: articleUrl,

// //         siteName: "लघुवित्त न्यूज",

// //         title,

// //         description,

// //         images: [
// //           {
// //             url: imageUrl,
// //             width: 1200,
// //             height: 630,
// //             alt: imageAlt,
// //           },
// //         ],

// //         publishedTime: news.publishedAt
// //           ? new Date(news.publishedAt).toISOString()
// //           : undefined,

// //         modifiedTime: news.updatedAt
// //           ? new Date(news.updatedAt).toISOString()
// //           : undefined,
// //       },

// //       twitter: {
// //         card: "summary_large_image",

// //         title,

// //         description,

// //         images: [
// //           {
// //             url: imageUrl,
// //             alt: imageAlt,
// //           },
// //         ],
// //       },
// //     };
// //   } catch (error) {
// //     console.error(
// //       "generateMetadata error:",
// //       error
// //     );

// //     return {
// //       title: "लघुवित्त न्यूज",

// //       description:
// //         "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

// //       robots: {
// //         index: false,
// //         follow: false,
// //       },
// //     };
// //   }
// // }
// // // =====================================================
// // // NEWS PAGE
// // // =====================================================

// // export default async function NewsPage({ params }) {
// //   const { slug } = await params;

// //   await connectDB();

// //   // ========================================
// //   // Get published news
// //   // ========================================

// //   const news = await News.findOne({
// //     slug,
// //     status: "published",
// //   })
// //     .populate("categories")
// //     .lean();

// //   if (!news) {
// //     notFound();
// //   }

// //   // ========================================
// //   // Normalize Cover Image
// //   // ========================================

// //   let coverImage = {
// //     url: "",
// //     alt: news.title,
// //   };

// //   if (typeof news.coverImage === "string") {
// //     coverImage = {
// //       url: news.coverImage,
// //       alt:
// //         news.imageAlt ||
// //         news.title,
// //     };
// //   } else if (
// //     news.coverImage &&
// //     typeof news.coverImage === "object"
// //   ) {
// //     coverImage = {
// //       url: news.coverImage.url || "",

// //       alt:
// //         news.coverImage.alt ||
// //         news.imageAlt ||
// //         news.title,
// //     };
// //   }

// //   // ========================================
// //   // Serialize data
// //   // ========================================

// //   const serializedNews = {
// //     ...news,

// //     _id: news._id.toString(),

// //     coverImage,

// //     categories: (news.categories || []).map(
// //       (category) => ({
// //         ...category,
// //         _id: category._id.toString(),
// //       })
// //     ),

// //     images: (news.images || []).map(
// //       (image) => ({
// //         ...image,

// //         _id: image._id
// //           ? image._id.toString()
// //           : undefined,

// //         url: image.url || "",

// //         alt:
// //           image.alt ||
// //           news.title,

// //         caption:
// //           image.caption ||
// //           "",
// //       })
// //     ),

// //     tags: Array.isArray(news.tags)
// //       ? news.tags
// //       : [],
// //   };

// //   // ========================================
// //   // Article URL
// //   // ========================================

// //   const articleUrl =
// //     `${SITE_URL}/news/${serializedNews.slug}`;

// //   // ========================================
// //   // DEBUG
// //   // ========================================

// //   console.log(
// //     "NEWS SLUG:",
// //     serializedNews.slug
// //   );

// //   console.log(
// //     "COVER IMAGE:",
// //     serializedNews.coverImage
// //   );

// //   console.log(
// //     "ARTICLE URL:",
// //     articleUrl
// //   );

// //   // ========================================
// //   // PAGE
// //   // ========================================

// //   return (
// //     <>
// //       <Header />

// //       <main className="min-h-screen bg-gray-50">

// //         <NewsArticleSchema
// //   news={serializedNews}
// //   articleUrl={articleUrl}
// // />

// // <BreadcrumbSchema
// //   items={[
// //     {
// //       name: "लघुवित्त न्यूज",
// //       url: SITE_URL,
// //     },

// //     {
// //       name: "समाचार",
// //       url: `${SITE_URL}/news`,
// //     },

// //     ...(serializedNews.categories?.[0]
// //       ? [
// //           {
// //             name:
// //               serializedNews.categories[0].name,

// //             url:
// //               `${SITE_URL}/category/${serializedNews.categories[0].slug}`,
// //           },
// //         ]
// //       : []),

// //     {
// //       name: serializedNews.title,
// //       url: articleUrl,
// //     },
// //   ]}
// // />

// //         <article className="mx-auto max-w-5xl px-4 py-10 md:px-8">


// // <nav
// //   aria-label="Breadcrumb"
// //   className="mb-6 text-sm text-gray-500"
// // >
// //   <ol className="flex flex-wrap items-center gap-2">
// //     <li>
// //       <a
// //         href="/"
// //         className="hover:text-[#005b37]"
// //       >
// //         गृहपृष्ठ
// //       </a>
// //     </li>

// //     <li>/</li>

// //     <li>
// //       <a
// //         href="/news"
// //         className="hover:text-[#005b37]"
// //       >
// //         समाचार
// //       </a>
// //     </li>

// //     {serializedNews.categories?.[0] && (
// //       <>
// //         <li>/</li>

// //         <li>
// //           <a
// //             href={`/category/${serializedNews.categories[0].slug}`}
// //             className="hover:text-[#005b37]"
// //           >
// //             {serializedNews.categories[0].name}
// //           </a>
// //         </li>
// //       </>
// //     )}

// //     <li>/</li>

// //     <li
// //       className="truncate text-gray-700"
// //       aria-current="page"
// //     >
// //       {serializedNews.title}
// //     </li>
// //   </ol>
// // </nav>
// //           {/* =========================
// //               CATEGORIES
// //           ========================== */}

// //           {serializedNews.categories.length > 0 && (
// //             <div className="mb-4 flex flex-wrap gap-2">

// //               {serializedNews.categories.map(
// //                 (category) => (
// //                   <span
// //                     key={category._id}
// //                     className="rounded-full bg-[#005b37] px-3 py-1 text-sm font-medium text-white"
// //                   >
// //                     {category.name}
// //                   </span>
// //                 )
// //               )}

// //             </div>
// //           )}

// //           {/* =========================
// //               TITLE
// //           ========================== */}

// //           <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
// //             {serializedNews.title}
// //           </h1>

// //           {/* =========================
// //               EXCERPT
// //           ========================== */}

// //           {serializedNews.excerpt && (
// //             <p className="mt-4 text-lg leading-8 text-gray-600">
// //               {serializedNews.excerpt}
// //             </p>
// //           )}

// //           {/* =========================
// //               META
// //           ========================== */}

// //           <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">

// //             {/* {serializedNews.publishedAt && (
// //               <span>
// //                 {new Intl.DateTimeFormat(
// //                   "ne-NP",
// //                   {
// //                     dateStyle: "medium",
// //                     timeZone: "Asia/Kathmandu",
// //                   }
// //                 ).format(
// //                   new Date(
// //                     serializedNews.publishedAt
// //                   )
// //                 )}
// //               </span>
// //             )} */}


// // {serializedNews.publishedAt && (
// //   <span>
// //     {new Intl.DateTimeFormat(
// //       "ne-NP",
// //       {
// //         dateStyle: "medium",
// //         timeZone: "Asia/Kathmandu",
// //       }
// //     ).format(
// //       new Date(
// //         serializedNews.publishedAt
// //       )
// //     )}
// //   </span>
// // )}
// //             {serializedNews.readTime && (
// //               <span>
// //                 {serializedNews.readTime} min read
// //               </span>
// //             )}

// //             <span>
// //               {serializedNews.views || 0} views
// //             </span>

// //           </div>

// //           {/* =========================
// //               SHARE BUTTONS
// //           ========================== */}

// //           <ShareButtons
// //             url={articleUrl}
// //             title={serializedNews.title}
// //             description={
// //               serializedNews.excerpt || ""
// //             }
// //           />

// //           {/* =========================
// //               COVER IMAGE
// //           ========================== */}

// //           {/* {serializedNews.coverImage.url ? (
// //             <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">

// //               <img
// //                 src={
// //                   serializedNews.coverImage.url
// //                 }
// //                 alt={
// //                   serializedNews.coverImage.alt ||
// //                   serializedNews.title
// //                 }
// //                 className="block h-auto max-h-[650px] w-full object-cover"
// //               />

// //             </div>
// //           ) : (
// //             <div className="mt-8 flex aspect-video items-center justify-center rounded-xl bg-gray-200 text-gray-500">
// //               No cover image available
// //             </div>
// //           )} */}

// // {serializedNews.coverImage.url ? (
// //   <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">
// //     <Image
// //       src={serializedNews.coverImage.url}
// //       alt={
// //         serializedNews.coverImage.alt ||
// //         serializedNews.title
// //       }
// //       width={1200}
// //       height={675}
// //       priority
// //       className="h-auto w-full object-cover"
// //     />
// //   </div>
// // ) : (
// //   <div className="mt-8 flex aspect-video items-center justify-center rounded-xl bg-gray-200 text-gray-500">
// //     No cover image available
// //   </div>
// // )}
// //           {/* =========================
// //               ARTICLE CONTENT
// //           ========================== */}

// //           <div
// //             className="prose prose-lg mt-10 max-w-none"
// //             dangerouslySetInnerHTML={{
// //               __html:
// //                 serializedNews.content,
// //             }}
// //           />

// //           {/* =========================
// //               GALLERY
// //           ========================== */}

// //           {serializedNews.images.length > 0 && (
// //             <div className="mt-10 grid gap-5 sm:grid-cols-2">

// //               {serializedNews.images.map(
// //                 (image, index) => {

// //                   if (!image.url) {
// //                     return null;
// //                   }

// //                   return (
// //                     <figure
// //                       key={
// //                         image._id ||
// //                         `${image.url}-${index}`
// //                       }
// //                       className="overflow-hidden rounded-lg bg-white"
// //                     >

// //                       <img
// //                         src={image.url}
// //                         alt={
// //                           image.alt ||
// //                           serializedNews.title
// //                         }
// //                         className="block h-auto w-full object-cover"
// //                       />

// //                       {image.caption && (
// //                         <figcaption className="p-3 text-sm text-gray-500">
// //                           {image.caption}
// //                         </figcaption>
// //                       )}

// //                     </figure>
// //                   );
// //                 }
// //               )}

// //             </div>
// //           )}

// //           {/* =========================
// //               TAGS
// //           ========================== */}

// //           {serializedNews.tags.length > 0 && (
// //             <div className="mt-10 flex flex-wrap gap-2">

// //               {serializedNews.tags.map(
// //                 (tag, index) => (
// //                   <span
// //                     key={`${tag}-${index}`}
// //                     className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
// //                   >
// //                     #{tag}
// //                   </span>
// //                 )
// //               )}

// //             </div>
// //           )}

// //           {/* =========================
// //               SHARE BUTTONS - BOTTOM
// //           ========================== */}

// //           {/* <ShareButtons
// //             url={articleUrl}
// //             title={serializedNews.title}
// //             description={
// //               serializedNews.excerpt || ""
// //             }
// //           /> */}

// //           {/* =========================
// //               VIEW TRACKING
// //           ========================== */}

// //           <ViewTracker
// //             newsId={serializedNews._id}
// //           />

// //         </article>
     

// //       </main>

// //       <Footer />
// //     </>
// //   );
// // }




// import { notFound } from "next/navigation";
// import Image from "next/image";

// import Header from "@/components/Header";
// import Footer from "@/components/Footer";
// import ViewTracker from "@/components/ViewTracker";
// import ShareButtons from "@/components/ShareButtons";

// import { connectDB } from "@/lib/db";
// import News from "@/models/News";

// import NewsArticleSchema from "@/components/NewsArticleSchema";
// import BreadcrumbSchema from "@/components/BreadcrumbSchema";

// export const dynamic = "force-dynamic";

// // =====================================================
// // SITE CONFIG
// // =====================================================

// const SITE_URL =
//   process.env.NEXT_PUBLIC_SITE_URL ||
//   "http://localhost:3000";

// const SITE_NAME = "लघुवित्त न्यूज";

// const DEFAULT_OG_IMAGE =
//   `${SITE_URL}/images/laghubitta.jpg`;

// // =====================================================
// // HELPERS
// // =====================================================

// function getAbsoluteUrl(url) {
//   if (!url) {
//     return "";
//   }

//   if (
//     url.startsWith("http://") ||
//     url.startsWith("https://")
//   ) {
//     return url;
//   }

//   return `${SITE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
// }

// // -----------------------------------------------------
// // Normalize cover image
// // -----------------------------------------------------

// function normalizeCoverImage(news) {
//   if (!news?.coverImage) {
//     return {
//       url: "",
//       alt: news?.title || SITE_NAME,
//     };
//   }

//   // Old migrated format:
//   //
//   // coverImage: "https://..."
//   //
//   if (typeof news.coverImage === "string") {
//     return {
//       url: getAbsoluteUrl(news.coverImage),
//       alt:
//         news.imageAlt?.trim() ||
//         news.title ||
//         SITE_NAME,
//     };
//   }

//   // Current format:
//   //
//   // coverImage: {
//   //   url: "...",
//   //   alt: "..."
//   // }
//   //
//   if (
//     typeof news.coverImage === "object"
//   ) {
//     return {
//       url: getAbsoluteUrl(
//         news.coverImage.url || ""
//       ),

//       alt:
//         news.coverImage.alt?.trim() ||
//         news.imageAlt?.trim() ||
//         news.title ||
//         SITE_NAME,
//     };
//   }

//   return {
//     url: "",
//     alt: news.title || SITE_NAME,
//   };
// }

// // =====================================================
// // DYNAMIC METADATA
// // =====================================================

// export async function generateMetadata({ params }) {
//   const { slug } = await params;

//   try {
//     await connectDB();

//     const news = await News.findOne({
//       slug,
//       status: "published",
//     })
//       .select(
//         `
//         title
//         slug
//         excerpt
//         coverImage
//         imageAlt
//         publishedAt
//         updatedAt
//         author
//         tags
//         `
//       )
//       .lean();

//     // =================================================
//     // ARTICLE NOT FOUND
//     // =================================================

//     if (!news) {
//       return {
//         title: "समाचार भेटिएन",

//         description:
//           "तपाईंले खोज्नुभएको समाचार भेटिएन।",

//         robots: {
//           index: false,
//           follow: false,
//         },
//       };
//     }

//     // =================================================
//     // BASIC DATA
//     // =================================================

//     const title =
//       news.title?.trim() ||
//       SITE_NAME;

//     const description =
//       news.excerpt?.trim() ||
//       `${title} — ${SITE_NAME}मा प्रकाशित समाचार।`;

//     const articleUrl =
//       `${SITE_URL}/news/${news.slug}`;

//     const coverImage =
//       normalizeCoverImage(news);

//     const imageUrl =
//       coverImage.url ||
//       DEFAULT_OG_IMAGE;

//     const imageAlt =
//       coverImage.alt ||
//       title;

//     // =================================================
//     // RETURN METADATA
//     // =================================================

//     return {
//       metadataBase: new URL(SITE_URL),

//       title,

//       description,

//       keywords:
//         Array.isArray(news.tags)
//           ? news.tags
//           : [],

//       authors: [
//         {
//           name:
//             news.author?.name ||
//             SITE_NAME,

//           url:
//             news.author?.url ||
//             SITE_URL,
//         },
//       ],

//       alternates: {
//         canonical: articleUrl,
//       },

//       robots: {
//         index: true,
//         follow: true,

//         googleBot: {
//           index: true,
//           follow: true,

//           "max-image-preview":
//             "large",

//           "max-snippet": -1,

//           "max-video-preview": -1,
//         },
//       },

//       openGraph: {
//         type: "article",

//         locale: "ne_NP",

//         url: articleUrl,

//         siteName: SITE_NAME,

//         title,

//         description,

//         images: [
//           {
//             url: imageUrl,

//             width: 1200,

//             height: 630,

//             alt: imageAlt,
//           },
//         ],

//         publishedTime:
//           news.publishedAt
//             ? new Date(
//                 news.publishedAt
//               ).toISOString()
//             : undefined,

//         modifiedTime:
//           news.updatedAt
//             ? new Date(
//                 news.updatedAt
//               ).toISOString()
//             : undefined,

//         authors: [
//           news.author?.name ||
//             SITE_NAME,
//         ],
//       },

//       twitter: {
//         card:
//           "summary_large_image",

//         title,

//         description,

//         images: [
//           {
//             url: imageUrl,

//             alt: imageAlt,
//           },
//         ],
//       },
//     };
//   } catch (error) {
//     console.error(
//       "generateMetadata error:",
//       error
//     );

//     return {
//       title: SITE_NAME,

//       description:
//         "लघुवित्त, बैंकिङ तथा वित्तीय क्षेत्रका समाचार।",

//       robots: {
//         index: false,
//         follow: false,
//       },
//     };
//   }
// }

// // =====================================================
// // NEWS PAGE
// // =====================================================

// export default async function NewsPage({
//   params,
// }) {
//   const { slug } = await params;

//   await connectDB();

//   // ===================================================
//   // FETCH NEWS
//   // ===================================================

//   const news = await News.findOne({
//     slug,
//     status: "published",
//   })
//     .populate("categories")
//     .lean();

//   // ===================================================
//   // NOT FOUND
//   // ===================================================

//   if (!news) {
//     notFound();
//   }

//   // ===================================================
//   // COVER IMAGE
//   // ===================================================

//   const coverImage =
//     normalizeCoverImage(news);

//   // ===================================================
//   // SERIALIZE CATEGORIES
//   // ===================================================

//   const categories =
//     Array.isArray(news.categories)
//       ? news.categories
//           .filter(Boolean)
//           .map((category) => ({
//             ...category,

//             _id:
//               category._id.toString(),

//             name:
//               category.name || "",

//             slug:
//               category.slug || "",
//           }))
//       : [];

//   // ===================================================
//   // SERIALIZE GALLERY
//   // ===================================================

//   const images =
//     Array.isArray(news.images)
//       ? news.images
//           .filter(
//             (image) =>
//               image &&
//               image.url
//           )
//           .map(
//             (
//               image,
//               index
//             ) => ({
//               ...image,

//               _id: image._id
//                 ? image._id.toString()
//                 : `image-${index}`,

//               url:
//                 getAbsoluteUrl(
//                   image.url
//                 ),

//               alt:
//                 image.alt?.trim() ||
//                 news.title,

//               caption:
//                 image.caption ||
//                 "",
//             })
//           )
//       : [];

//   // ===================================================
//   // TAGS
//   // ===================================================

//   const tags =
//     Array.isArray(news.tags)
//       ? news.tags.filter(Boolean)
//       : [];

//   // ===================================================
//   // SERIALIZED NEWS
//   // ===================================================

//   const serializedNews = {
//     ...news,

//     _id:
//       news._id.toString(),

//     coverImage,

//     categories,

//     images,

//     tags,
//   };

//   // ===================================================
//   // ARTICLE URL
//   // ===================================================

//   const articleUrl =
//     `${SITE_URL}/news/${serializedNews.slug}`;

//   // ===================================================
//   // PAGE
//   // ===================================================

//   return (
//     <>
//       <Header />

//       <main className="min-h-screen bg-gray-50">

//         {/* ============================================
//             STRUCTURED DATA
//         ============================================ */}

//         <NewsArticleSchema
//           news={serializedNews}
//           articleUrl={articleUrl}
//         />

//         <BreadcrumbSchema
//           items={[
//             {
//               name: SITE_NAME,
//               url: SITE_URL,
//             },

//             {
//               name: "समाचार",
//               url: `${SITE_URL}/news`,
//             },

//             ...(categories[0]
//               ? [
//                   {
//                     name:
//                       categories[0].name,

//                     url:
//                       `${SITE_URL}/category/${categories[0].slug}`,
//                   },
//                 ]
//               : []),

//             {
//               name:
//                 serializedNews.title,

//               url: articleUrl,
//             },
//           ]}
//         />

//         {/* ============================================
//             ARTICLE
//         ============================================ */}

//         <article className="mx-auto max-w-5xl px-4 py-10 md:px-8">

//           {/* ==========================================
//               BREADCRUMB
//           ========================================== */}

//           <nav
//             aria-label="Breadcrumb"
//             className="mb-6 text-sm text-gray-500"
//           >
//             <ol className="flex flex-wrap items-center gap-2">

//               <li>
//                 <a
//                   href="/"
//                   className="hover:text-[#005b37]"
//                 >
//                   गृहपृष्ठ
//                 </a>
//               </li>

//               <li>/</li>

//               <li>
//                 <a
//                   href="/news"
//                   className="hover:text-[#005b37]"
//                 >
//                   समाचार
//                 </a>
//               </li>

//               {categories[0] && (
//                 <>
//                   <li>/</li>

//                   <li>
//                     <a
//                       href={`/category/${categories[0].slug}`}
//                       className="hover:text-[#005b37]"
//                     >
//                       {categories[0].name}
//                     </a>
//                   </li>
//                 </>
//               )}

//               <li>/</li>

//               <li
//                 className="truncate text-gray-700"
//                 aria-current="page"
//               >
//                 {serializedNews.title}
//               </li>

//             </ol>
//           </nav>

//           {/* ==========================================
//               CATEGORIES
//           ========================================== */}

//           {categories.length > 0 && (
//             <div className="mb-4 flex flex-wrap gap-2">

//               {categories.map(
//                 (category) => (
//                   <a
//                     key={category._id}
//                     href={`/category/${category.slug}`}
//                     className="rounded-full bg-[#005b37] px-3 py-1 text-sm font-medium text-white transition hover:opacity-90"
//                   >
//                     {category.name}
//                   </a>
//                 )
//               )}

//             </div>
//           )}

//           {/* ==========================================
//               TITLE
//           ========================================== */}

//           <h1 className="text-3xl font-bold leading-tight text-gray-900 md:text-5xl">
//             {serializedNews.title}
//           </h1>

//           {/* ==========================================
//               EXCERPT
//           ========================================== */}

//           {serializedNews.excerpt && (
//             <p className="mt-4 text-lg leading-8 text-gray-600">
//               {serializedNews.excerpt}
//             </p>
//           )}

//           {/* ==========================================
//               META
//           ========================================== */}

//           <div className="mt-5 flex flex-wrap gap-4 text-sm text-gray-500">

//             {serializedNews.publishedAt && (
//               <time
//                 dateTime={
//                   new Date(
//                     serializedNews.publishedAt
//                   ).toISOString()
//                 }
//               >
//                 {new Intl.DateTimeFormat(
//                   "ne-NP",
//                   {
//                     dateStyle: "medium",
//                     timeZone:
//                       "Asia/Kathmandu",
//                   }
//                 ).format(
//                   new Date(
//                     serializedNews.publishedAt
//                   )
//                 )}
//               </time>
//             )}

//             {serializedNews.author?.name && (
//               <span>
//                 लेखक:{" "}
//                 {serializedNews.author.name}
//               </span>
//             )}

//             {serializedNews.readTime && (
//               <span>
//                 {serializedNews.readTime} min read
//               </span>
//             )}

//             <span>
//               {serializedNews.views || 0} views
//             </span>

//           </div>

//           {/* ==========================================
//               SHARE BUTTONS
//           ========================================== */}

//           <ShareButtons
//             url={articleUrl}
//             title={
//               serializedNews.title
//             }
//             description={
//               serializedNews.excerpt ||
//               ""
//             }
//           />

//           {/* ==========================================
//               COVER IMAGE
//           ========================================== */}

//           {coverImage.url ? (
//             <div className="mt-8 overflow-hidden rounded-xl bg-gray-100">

//               <Image
//                 src={coverImage.url}
//                 alt={
//                   coverImage.alt ||
//                   serializedNews.title
//                 }
//                 width={1200}
//                 height={675}
//                 priority
//                 sizes="(max-width: 768px) 100vw, 1024px"
//                 className="h-auto w-full object-cover"
//               />

//             </div>
//           ) : (
//             <div className="mt-8 flex aspect-video items-center justify-center rounded-xl bg-gray-200 text-gray-500">
//               No cover image available
//             </div>
//           )}

//           {/* ==========================================
//               ARTICLE CONTENT
//           ========================================== */}

//           <div
//             className="prose prose-lg mt-10 max-w-none"
//             dangerouslySetInnerHTML={{
//               __html:
//                 serializedNews.content ||
//                 "",
//             }}
//           />

//           {/* ==========================================
//               GALLERY
//           ========================================== */}

//           {images.length > 0 && (
//             <div className="mt-10 grid gap-5 sm:grid-cols-2">

//               {images.map(
//                 (image) => (
//                   <figure
//                     key={image._id}
//                     className="overflow-hidden rounded-lg bg-white"
//                   >

//                     <Image
//                       src={image.url}
//                       alt={
//                         image.alt ||
//                         serializedNews.title
//                       }
//                       width={900}
//                       height={600}
//                       sizes="(max-width: 640px) 100vw, 50vw"
//                       className="h-auto w-full object-cover"
//                     />

//                     {image.caption && (
//                       <figcaption className="p-3 text-sm text-gray-500">
//                         {image.caption}
//                       </figcaption>
//                     )}

//                   </figure>
//                 )
//               )}

//             </div>
//           )}

//           {/* ==========================================
//               TAGS
//           ========================================== */}

//           {tags.length > 0 && (
//             <div className="mt-10 flex flex-wrap gap-2">

//               {tags.map(
//                 (tag, index) => (
//                   <span
//                     key={`${tag}-${index}`}
//                     className="rounded-full bg-gray-200 px-3 py-1 text-sm text-gray-700"
//                   >
//                     #{tag}
//                   </span>
//                 )
//               )}

//             </div>
//           )}

//           {/* ==========================================
//               VIEW TRACKING
//           ========================================== */}

//           <ViewTracker
//             newsId={
//               serializedNews._id
//             }
//           />

//         </article>
//       </main>

//       <Footer />
//     </>
//   );
// }



import {
  notFound,
  permanentRedirect,
} from "next/navigation";

import Image from "next/image";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ViewTracker from "@/components/ViewTracker";
import ShareButtons from "@/components/ShareButtons";

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

/**
 * Convert relative image URLs into absolute URLs.
 *
 * Examples:
 *
 * /images/logo.jpg
 *      ↓
 * https://laghubittanews.com/images/logo.jpg
 *
 * https://res.cloudinary.com/...
 *      ↓
 * remains unchanged
 */
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


/**
 * Normalize coverImage.
 *
 * Current format:
 *
 * coverImage: {
 *   url: "...",
 *   alt: "..."
 * }
 *
 * Old format may still be:
 *
 * coverImage: "..."
 */
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


/**
 * Find an old slug inside Redirect collection.
 *
 * Example:
 *
 * old-slug
 *    ↓
 * Redirect
 *    ↓
 * canonical-slug
 */
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

  // -------------------------------------------------------
  // FIRST: Try to find the actual article
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // ARTICLE NOT FOUND
  // Check Redirect collection
  // -------------------------------------------------------

  if (!news) {
    const redirect =
      await findNewsRedirect(slug);

    if (redirect?.toSlug) {
      permanentRedirect(
        `/news/${redirect.toSlug}`
      );
    }

    // No article and no redirect.
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

  // -------------------------------------------------------
  // COVER IMAGE
  // -------------------------------------------------------

  const coverImage =
    normalizeCoverImage(news);

  const imageUrl = coverImage.url;

  // -------------------------------------------------------
  // DESCRIPTION
  // -------------------------------------------------------

  const description =
    news.excerpt?.trim() ||
    news.title ||
    `${SITE_NAME} मा प्रकाशित समाचार।`;

  // -------------------------------------------------------
  // ARTICLE URL
  // -------------------------------------------------------

  const articleUrl =
    `${SITE_URL}/news/${news.slug}`;

  // -------------------------------------------------------
  // KEYWORDS
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // CATEGORIES
  // -------------------------------------------------------

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

  // -------------------------------------------------------
  // FINAL KEYWORDS
  // -------------------------------------------------------

  const finalKeywords = [
    ...keywords,
    ...categories,
    "लघुवित्त",
    "लघुवित्त न्यूज",
    "माइक्रोफाइनान्स",
    "नेपाल",
  ];

  // Remove duplicates
  const uniqueKeywords = [
    ...new Set(
      finalKeywords.filter(Boolean)
    ),
  ];

  // -------------------------------------------------------
  // PUBLISHED DATE
  // -------------------------------------------------------

  const publishedTime =
    news.publishedAt ||
    news.originalPublishedAt ||
    news.createdAt;

  // -------------------------------------------------------
  // MODIFIED DATE
  // -------------------------------------------------------

  const modifiedTime =
    news.updatedAt ||
    publishedTime;

  // -------------------------------------------------------
  // METADATA
  // -------------------------------------------------------

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

  let news =
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
  // CHECK PERMANENT REDIRECT
  // =======================================================

  if (!news) {
    const redirect =
      await findNewsRedirect(slug);

    if (redirect?.toSlug) {
      permanentRedirect(
        `/news/${redirect.toSlug}`
      );
    }

    // No article and no redirect.
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

            {/* AUTHOR */}

            <div>
              <span className="font-medium text-gray-700">
                लेखक:
              </span>{" "}
              {news.author?.name ||
                news.wordpressAuthor ||
                SITE_NAME}
            </div>


            {/* DATE */}

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


            {/* READ TIME */}

            {news.readTime && (
              <span>
                पढ्न लाग्ने समय:{" "}
                {news.readTime} मिनेट
              </span>
            )}


            {/* VIEWS */}

            {typeof news.views ===
              "number" && (
              <span>
                भ्यु: {news.views}
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


          {/* =================================================
              VIEW TRACKER
          ================================================= */}

          {news._id && (
            <ViewTracker
              newsId={String(
                news._id
              )}
            />
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