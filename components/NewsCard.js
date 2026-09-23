import Link from "next/link";

export default function NewsCard({ news, compact = false }) {
  return (
    <article className={`group rounded-xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${compact ? "flex gap-4" : ""}`}>
      <Link href={`/news/${news.slug}`} className={compact ? "w-32 shrink-0 md:w-40" : "block"}>
        <div className={`overflow-hidden rounded-lg bg-gray-100 ${compact ? "aspect-video" : "aspect-video"}`}>
          {news.coverImage ? (
            <img src={news.coverImage} alt={news.imageAlt || news.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          ) : (
            <div className="flex h-full items-center justify-center bg-[#dee9fc] text-sm font-bold text-[#005b37]">LAGHUBITTA NEWS</div>
          )}
        </div>
      </Link>
      <div className={compact ? "min-w-0" : "mt-3"}>
        <div className="text-xs font-bold text-[#005b37]">{news.category?.name || "समाचार"}</div>
        <Link href={`/news/${news.slug}`}>
          <h3 className="mt-1 line-clamp-3 text-base font-bold leading-snug group-hover:text-[#005b37]">{news.title}</h3>
        </Link>
        <div className="mt-2 text-xs text-gray-500">{new Date(news.publishedAt || news.createdAt).toLocaleDateString("ne-NP")}</div>
      </div>
    </article>
  );
}