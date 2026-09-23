import AdminShell from "@/components/admin/AdminShell";
import NewsForm from "@/components/admin/NewsForm";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";
import { notFound } from "next/navigation";

export default async function EditNewsPage({params}){
  const {id}=await params;
  await connectDB();
  const [news,categories]=await Promise.all([
    News.findById(id).lean(),
    Category.find({isActive:true}).sort({name:1}).lean()
  ]);
  if(!news)notFound();
  return <AdminShell title="Edit News"><NewsForm initial={{...news,_id:String(news._id),category:String(news.category)}} categories={categories.map(c=>({...c,_id:String(c._id)}))}/></AdminShell>;
}