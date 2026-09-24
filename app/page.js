
import Link from "next/link";

import Header from "@/components/Header";
import Footer from "@/components/Footer";
import NewsCard from "@/components/NewsCard";
import Section from "@/components/Section";
import { getHomeNews } from "@/lib/news";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const data = await getHomeNews();

  // Featured news is preferred.
  // If there is no featured news, use the latest news.
  const lead = data.featured || data.latest?.[0];

  return (
    <>
      <Header />

      <main className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 md:px-8">

        {/* =====================================================
            FEATURED / LEAD NEWS
        ====================================================== */}
        {lead && (
          <article className="overflow-hidden rounded-xl bg-white p-4 shadow-sm md:p-6">

            {/* Labels */}
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-[#005b37] px-3 py-1 text-xs font-bold text-white">
                मुख्य समाचार
              </span>

              {lead.breaking && (
                <span className="rounded bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                  BREAKING
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl font-bold leading-tight text-[#005b37] md:text-4xl">
              {lead.title}
            </h1>

            {/* Cover Image */}
            <div className="mt-5 aspect-[21/9] overflow-hidden rounded-lg bg-gray-100">
              {lead.coverImage?.url ? (
                <img
                  src={lead.coverImage.url}
                  alt={lead.coverImage.alt || lead.title}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Excerpt + Read More */}
            <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-start">
              <p className="flex-1 text-base leading-8 text-gray-700">
                {lead.excerpt}
              </p>

              <Link
                href={`/news/${lead.slug}`}
                className="self-start rounded-lg bg-[#005b37] px-4 py-2 font-bold text-white transition hover:bg-[#00482b]"
              >
                विस्तृत पढ्नुहोस्
              </Link>
            </div>
          </article>
        )}

        {/* =====================================================
            LATEST NEWS
        ====================================================== */}
        {data.latest?.length > 1 && (
          <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {data.latest.slice(1, 3).map((news) => (
              <NewsCard
                key={news._id}
                news={news}
              />
            ))}
          </section>
        )}

        {/* =====================================================
            MICROFINANCE NEWS
        ====================================================== */}
        <Section
          title="लघुवित्त समाचार"
          href="/category/microfinance-news"
          news={data.microfinanceNews}
        />

        {/* =====================================================
            MICROFINANCE SPECIAL
        ====================================================== */}
        <section className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded bg-[#006d36] px-4 py-3 text-white">
            <h2 className="text-xl font-bold">
              लघुवित्त विशेष
            </h2>

            <Link
              href="/category/microfinance-special"
              className="text-sm text-[#8cf9a9] transition hover:text-white"
            >
              थप विशेष →
            </Link>
          </div>

          {data.special?.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.special.map((news) => (
                <NewsCard
                  key={news._id}
                  news={news}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-lg bg-white p-8 text-center text-gray-500 shadow-sm">
              यस श्रेणीमा अहिले समाचार उपलब्ध छैन।
            </div>
          )}
        </section>

        {/* =====================================================
            OPINION / ENTREPRENEURSHIP / PHOTO STORIES
        ====================================================== */}
        <section className="rounded-2xl bg-gradient-to-br from-[#eff4ff] via-white to-[#f3fff7] p-4 md:p-6 lg:p-8">

          {/* Section Header */}
          <div className="mb-6 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#005b37]">
                विशेष सामग्री
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-[#17202a] md:text-3xl">
                विचार, उद्यमशीलता र फोटो कथा
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                विचार, व्यवसाय र दृश्य कथाहरूबाट विशेष सामग्री
              </p>
            </div>
          </div>

          {/* Three Columns */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

            {/* =====================================================
                OPINION
            ====================================================== */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#005b37] text-sm font-bold text-white">
                    वि
                  </span>

                  <div>
                    <h3 className="font-bold text-[#17202a]">
                      विचार
                    </h3>

                    <p className="text-xs text-gray-500">
                      विचार तथा सम्पादकीय
                    </p>
                  </div>
                </div>

                <Link
                  href="/category/opinion-and-editorial"
                  className="text-xs font-bold text-[#005b37] hover:underline"
                >
                  सबै →
                </Link>
              </div>

              <div className="p-4">
                {data.opinion?.length > 0 ? (
                  <div className="space-y-4">
                    {data.opinion.slice(0, 3).map((news, index) => (
                      <article
                        key={news._id}
                        className={`group ${
                          index !== 0
                            ? "border-t border-gray-100 pt-4"
                            : ""
                        }`}
                      >
                        <Link
                          href={`/news/${news.slug}`}
                          className="block"
                        >
                          {index === 0 && news.coverImage?.url && (
                            <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                              <img
                                src={news.coverImage.url}
                                alt={
                                  news.coverImage.alt ||
                                  news.title
                                }
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}

                          <h4 className="line-clamp-2 font-bold leading-6 text-[#17202a] transition group-hover:text-[#005b37]">
                            {news.title}
                          </h4>

                          {index === 0 && news.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                              {news.excerpt}
                            </p>
                          )}
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    समाचार उपलब्ध छैन।
                  </p>
                )}
              </div>
            </div>

            {/* =====================================================
                ENTREPRENEURSHIP
            ====================================================== */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#006d36] text-sm font-bold text-white">
                    उ
                  </span>

                  <div>
                    <h3 className="font-bold text-[#17202a]">
                      उद्यमशीलता
                    </h3>

                    <p className="text-xs text-gray-500">
                      व्यवसाय तथा उद्यम
                    </p>
                  </div>
                </div>

                <Link
                  href="/category/entrepreneurship"
                  className="text-xs font-bold text-[#005b37] hover:underline"
                >
                  सबै →
                </Link>
              </div>

              <div className="p-4">
                {data.entrepreneurship?.length > 0 ? (
                  <div className="space-y-4">
                    {data.entrepreneurship
                      .slice(0, 3)
                      .map((news, index) => (
                        <article
                          key={news._id}
                          className={`group ${
                            index !== 0
                              ? "border-t border-gray-100 pt-4"
                              : ""
                          }`}
                        >
                          <Link
                            href={`/news/${news.slug}`}
                            className="block"
                          >
                            {index === 0 && news.coverImage?.url && (
                              <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                                <img
                                  src={news.coverImage.url}
                                  alt={
                                    news.coverImage.alt ||
                                    news.title
                                  }
                                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                                />
                              </div>
                            )}

                            <h4 className="line-clamp-2 font-bold leading-6 text-[#17202a] transition group-hover:text-[#005b37]">
                              {news.title}
                            </h4>

                            {index === 0 && news.excerpt && (
                              <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                                {news.excerpt}
                              </p>
                            )}
                          </Link>
                        </article>
                      ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    समाचार उपलब्ध छैन।
                  </p>
                )}
              </div>
            </div>

            {/* =====================================================
                PHOTO STORIES
            ====================================================== */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition hover:shadow-md">

              <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4">
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#17202a] text-sm font-bold text-white">
                    फो
                  </span>

                  <div>
                    <h3 className="font-bold text-[#17202a]">
                      फोटो कथा
                    </h3>

                    <p className="text-xs text-gray-500">
                      दृश्य कथा तथा तस्वीर
                    </p>
                  </div>
                </div>

                <Link
                  href="/category/photo-stories"
                  className="text-xs font-bold text-[#005b37] hover:underline"
                >
                  सबै →
                </Link>
              </div>

              <div className="p-4">
                {data.photo?.length > 0 ? (
                  <div className="space-y-4">
                    {data.photo.slice(0, 3).map((news, index) => (
                      <article
                        key={news._id}
                        className={`group ${
                          index !== 0
                            ? "border-t border-gray-100 pt-4"
                            : ""
                        }`}
                      >
                        <Link
                          href={`/news/${news.slug}`}
                          className="block"
                        >
                          {index === 0 && news.coverImage?.url && (
                            <div className="mb-3 aspect-[16/9] overflow-hidden rounded-xl bg-gray-100">
                              <img
                                src={news.coverImage.url}
                                alt={
                                  news.coverImage.alt ||
                                  news.title
                                }
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            </div>
                          )}

                          <h4 className="line-clamp-2 font-bold leading-6 text-[#17202a] transition group-hover:text-[#005b37]">
                            {news.title}
                          </h4>

                          {index === 0 && news.excerpt && (
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-gray-500">
                              {news.excerpt}
                            </p>
                          )}
                        </Link>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p className="py-8 text-center text-sm text-gray-500">
                    फोटो कथा उपलब्ध छैन।
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            NOTICES
        ====================================================== */}
        <Section
          title="लघुवित्त सूचना"
          href="/category/notices-and-vacancy"
          news={data.notices}
        />

        {/* =====================================================
            NATIONAL POLICY
        ====================================================== */}
        <Section
          title="राष्ट्रिय नीति"
          href="/category/national-policy"
          news={data.policy}
        />

        {/* =====================================================
            EDITORIAL / COPYRIGHT INFORMATION
        ====================================================== */}
        <aside className="rounded-xl bg-[#27313f] p-6 text-white">
          <h3 className="font-bold text-[#8cf9a9]">
            संपादकीय प्रतिबद्धता तथा सर्वाधिकार जानकारी
          </h3>

          <p className="mt-2 text-sm leading-7 opacity-90">
            वित्तीय साक्षरता र उद्यमशीलताका लागि प्रकाशित Laghubitta News
            वित्तीय क्षेत्रको डिजिटल प्लेटफर्म हो। यहाँ वित्तीय क्षेत्र,
            लघुवित्त तथा उद्यमशीलतासम्बन्धी अध्ययन सामग्री र समाचार
            प्रकाशित गरिन्छ।
          </p>

          <div className="mt-3 text-xs opacity-80">
            media.intnepal@gmail.com · ९७४१८०३६००
          </div>
        </aside>

      </main>

      <Footer />
    </>
  );
}
