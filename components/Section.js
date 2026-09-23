import Link from "next/link";
import NewsCard from "./NewsCard";

export default function Section({ title, news = [], href }) {
  return (
    <section className="flex flex-col gap-4">
      <div className="flex items-center justify-between rounded bg-[#005b37] px-4 py-3 text-white">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-[#8cf9a9]" />
          <h2 className="text-xl font-bold">{title}</h2>
        </div>
        {href && <Link href={href} className="text-sm text-[#8cf9a9]">सबै हेर्नुहोस् →</Link>}
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {news.map((item) => <NewsCard key={item._id} news={item} compact />)}
      </div>
    </section>
  );
}