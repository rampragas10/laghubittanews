
import Link from "next/link";

export default function NewsCard({
  news,
  compact = false,
}) {
  // ============================================
  // SAFETY CHECK
  // ============================================

  const slug =
    typeof news?.slug === "string"
      ? news.slug.trim()
      : "";

  if (!slug) {
    console.warn("NewsCard: Invalid slug", news);
    return null;
  }

  // ============================================
  // COVER IMAGE
  // ============================================

  const coverImageUrl =
    typeof news.coverImage === "string"
      ? news.coverImage
      : news.coverImage?.url || "";

  const coverImageAlt =
    typeof news.coverImage === "string"
      ? news.imageAlt || news.title
      : news.coverImage?.alt || news.title;

  // ============================================
  // CATEGORY
  // ============================================

  const categoryName =
    news.categories?.[0]?.name ||
    news.category?.name ||
    "समाचार";

  return (
    <article
      className={`group rounded-xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        compact ? "flex gap-4" : ""
      }`}
    >
      {/* ============================================
          IMAGE
      ============================================ */}

      <Link
        href={`/news/${slug}`}
        className={compact ? "w-32 shrink-0 md:w-40" : "block"}
      >
        <div className="aspect-video overflow-hidden rounded-lg bg-gray-100">
          {coverImageUrl ? (
            <img
              src={coverImageUrl}
              alt={coverImageAlt}
              className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#dee9fc] text-sm font-bold text-[#005b37]">
              LAGHUBITTA NEWS
            </div>
          )}
        </div>
      </Link>

      {/* ============================================
          CONTENT
      ============================================ */}

      <div className={compact ? "min-w-0" : "mt-3"}>
        <div className="text-xs font-bold text-[#005b37]">
          {categoryName}
        </div>

        <Link href={`/news/${slug}`}>
          <h3 className="mt-1 line-clamp-3 text-base font-bold leading-snug group-hover:text-[#005b37]">
            {news.title}
          </h3>
        </Link>

        <div className="mt-2 text-xs text-gray-500">
          {new Date(
            news.publishedAt || news.createdAt
          ).toLocaleDateString("ne-NP")}
        </div>
      </div>
    </article>
  );
}
