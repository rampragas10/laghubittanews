import AdminShell from "@/components/admin/AdminShell";
import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  await connectDB();
  const [total, published, drafts, categories] = await Promise.all([
    News.countDocuments(), News.countDocuments({status:"published"}), News.countDocuments({status:"draft"}), Category.countDocuments()
  ]);
  return (
    <AdminShell title="Dashboard">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[["Total News",total],["Published",published],["Drafts",drafts],["Categories",categories]].map(([label,value])=>(
          <div key={label} className="rounded-xl bg-white p-5 shadow-sm"><div className="text-sm text-gray-500">{label}</div><div className="mt-2 text-3xl font-bold text-[#005b37]">{value}</div></div>
        ))}
      </div>
      <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
        <h2 className="text-xl font-bold">CMS workflow</h2>
        <p className="mt-2 text-gray-600">Create → edit → save draft → publish → feature/breaking → archive/delete. Public pages read published content directly from MongoDB.</p>
      </div>
    </AdminShell>
  );
}