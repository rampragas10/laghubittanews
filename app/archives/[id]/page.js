import { permanentRedirect, notFound } from "next/navigation";

import { connectDB } from "@/lib/db";
import News from "@/models/News";

export default async function OldWordPressArchivePage({
  params,
}) {
  const { id } = await params;

  await connectDB();

  const news = await News.findOne({
    wordpressId: Number(id),
    status: "published",
  })
    .select("slug")
    .lean();

  if (!news) {
    notFound();
  }

  permanentRedirect(
    `/news/${news.slug}`
  );
}