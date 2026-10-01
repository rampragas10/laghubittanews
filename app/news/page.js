
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import AdSlot from "@/components/ads/AdSlot";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

const NEWS_PER_PAGE = 20;

// =========================================================
// GET NEWS
// =========================================================

async function getNews(page) {
  await connectDB();

  const skip =
    (page - 1) * NEWS_PER_PAGE;

  const filter = {
    status: "published",
  };

  const [news, totalNews] =
    await Promise.all([
      News.find(filter)
        .select(
          "title slug excerpt coverImage imageAlt publishedAt categories"
        )
        .populate(
          "categories",
          "name slug"
        )
        .sort({
          publishedAt: -1,
          _id: -1,
        })
        .skip(skip)
        .limit(NEWS_PER_PAGE)
        .lean(),

      News.countDocuments(filter),
    ]);

  return {
    news,
    totalNews,

    totalPages: Math.ceil(
      totalNews / NEWS_PER_PAGE
    ),
  };
}

// =========================================================
// PAGE
// =========================================================

export default async function NewsPage({
  searchParams,
}) {
  const params = await searchParams;

  const requestedPage =
    Number(params?.page) || 1;

  const page =
    Number.isInteger(requestedPage) &&
    requestedPage > 0
      ? requestedPage
      : 1;

  const {
    news,
    totalNews,
    totalPages,
  } = await getNews(page);

  // =======================================================
  // INVALID PAGE
  // =======================================================

  if (
    page > totalPages &&
    totalPages > 0
  ) {
    return (
      <>
        <Header />

        <main className="min-h-screen bg-gray-50">

          <section className="mx-auto max-w-7xl px-4 py-16 md:px-8">

            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">

              <h1 className="text-2xl font-bold text-gray-900">
                समाचार पृष्ठ भेटिएन
              </h1>

              <p className="mt-2 text-gray-500">
                तपाईंले खोज्नुभएको पृष्ठ उपलब्ध छैन।
              </p>

              <Link
                href="/news"
                className="mt-6 inline-block rounded-lg bg-[#005b37] px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
              >
                सबै समाचार हेर्नुहोस्
              </Link>

            </div>

          </section>

        </main>

        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">

        {/* =================================================
            PAGE HEADER
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 pt-8 md:px-8">

          <div className="rounded-lg bg-[#005b37] px-5 py-6 text-white">

            <p className="mb-1 text-sm font-medium uppercase tracking-wide opacity-80">
              लघुवित्त न्यूज
            </p>

            <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">

              <div>

                <h1 className="text-3xl font-bold">
                  सबै समाचार
                </h1>

                <p className="mt-2 max-w-3xl text-sm opacity-80">
                  लघुवित्त तथा वित्तीय क्षेत्रका
                  ताजा समाचार तथा जानकारीहरू।
                </p>

              </div>

              <p className="text-sm opacity-80">
                जम्मा{" "}
                {totalNews.toLocaleString(
                  "ne-NP"
                )}{" "}
                समाचार
              </p>

            </div>

          </div>

        </section>

        {/* =================================================
            NEWS TOP AD
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 pt-6 md:px-8">

          <AdSlot
            position="NEWS_TOP"
            className="w-full"
          />

        </section>

        {/* =================================================
            NEWS
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-8">

          {news.length === 0 ? (
            <div className="rounded-lg border border-gray-200 bg-white p-10 text-center">

              <h2 className="text-xl font-semibold text-gray-900">
                कुनै समाचार भेटिएन
              </h2>

              <p className="mt-2 text-gray-500">
                हाल प्रकाशित समाचार उपलब्ध छैन।
              </p>

            </div>
          ) : (
            <>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">

                {news.map((item) => (
                  <NewsCard
                    key={item._id.toString()}
                    news={{
                      ...item,
                      _id: item._id.toString(),
                    }}
                  />
                ))}

              </div>

              {/* =================================================
                  NEWS MIDDLE AD
              ================================================= */}

              <div className="my-10">

                <AdSlot
                  position="NEWS_MIDDLE"
                  className="w-full"
                />

              </div>

              {/* =================================================
                  PAGINATION
              ================================================= */}

              {totalPages > 1 && (
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                />
              )}

            </>
          )}

        </section>

        {/* =================================================
            NEWS BOTTOM AD
        ================================================= */}

        <section className="mx-auto max-w-7xl px-4 pb-10 md:px-8">

          <AdSlot
            position="NEWS_BOTTOM"
            className="w-full"
          />

        </section>

      </main>

      <Footer />
    </>
  );
}

// =========================================================
// PAGINATION
// =========================================================

function Pagination({
  currentPage,
  totalPages,
}) {
  const pages = [];

  if (totalPages <= 7) {

    for (
      let i = 1;
      i <= totalPages;
      i++
    ) {
      pages.push(i);
    }

  } else {

    pages.push(1);

    if (currentPage > 4) {
      pages.push("...");
    }

    const start = Math.max(
      2,
      currentPage - 1
    );

    const end = Math.min(
      totalPages - 1,
      currentPage + 1
    );

    for (
      let i = start;
      i <= end;
      i++
    ) {
      pages.push(i);
    }

    if (
      currentPage <
      totalPages - 3
    ) {
      pages.push("...");
    }

    pages.push(totalPages);
  }

  return (
    <div className="mt-10">

      {/* Page information */}

      <p className="mb-4 text-center text-sm text-gray-500">
        पृष्ठ {currentPage} /{" "}
        {totalPages}
      </p>

      <nav
        aria-label="समाचार pagination"
        className="flex flex-wrap items-center justify-center gap-2"
      >

        {/* Previous */}

        {currentPage > 1 ? (
          <Link
            href={
              currentPage === 2
                ? "/news"
                : `/news?page=${
                    currentPage - 1
                  }`
            }
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
          >
            ← अघिल्लो
          </Link>
        ) : (
          <span className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
            ← अघिल्लो
          </span>
        )}

        {/* Numbers */}

        {pages.map((page, index) => {

          if (page === "...") {
            return (
              <span
                key={`dots-${index}`}
                className="px-2 text-gray-500"
              >
                ...
              </span>
            );
          }

          const active =
            page === currentPage;

          return (
            <Link
              key={page}
              href={
                page === 1
                  ? "/news"
                  : `/news?page=${page}`
              }
              aria-current={
                active
                  ? "page"
                  : undefined
              }
              className={
                active
                  ? "rounded-lg bg-[#005b37] px-4 py-2 text-sm font-semibold text-white"
                  : "rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
              }
            >
              {page}
            </Link>
          );
        })}

        {/* Next */}

        {currentPage < totalPages ? (
          <Link
            href={`/news?page=${
              currentPage + 1
            }`}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:border-[#005b37] hover:text-[#005b37]"
          >
            अर्को →
          </Link>
        ) : (
          <span className="rounded-lg border border-gray-200 bg-gray-100 px-4 py-2 text-sm font-medium text-gray-400">
            अर्को →
          </span>
        )}

      </nav>
    </div>
  );
}
