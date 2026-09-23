import Link from "next/link";
import AdminShell from "@/components/admin/AdminShell";
import { connectDB } from "@/lib/db";
import News from "@/models/News";

export const dynamic = "force-dynamic";

export default async function AdminNews() {
  await connectDB();
  const news = await News.find().populate("category").sort({createdAt:-1}).lean();
  return (
    <AdminShell title="News Management">
      <div className="mb-4 flex justify-end"><Link href="/admin/news/new" className="rounded-lg bg-[#005b37] px-4 py-2 font-bold text-white">+ Create News</Link></div>
      <div className="overflow-x-auto rounded-xl bg-white shadow-sm">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b bg-gray-50"><tr><th className="p-4">Title</th><th>Category</th><th>Status</th><th>Flags</th><th>Views</th><th>Action</th></tr></thead>
          <tbody>
            {news.map(n=><tr key={n._id} className="border-b last:border-0">
              <td className="max-w-md p-4 font-semibold">{n.title}</td>
              <td>{n.category?.name}</td><td>{n.status}</td>
              <td>{n.featured?"Featured ":""}{n.breaking?"Breaking":""}</td><td>{n.views}</td>
              <td><Link className="font-bold text-[#005b37]" href={`/admin/news/${n._id}/edit`}>Edit</Link></td>
            </tr>)}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}