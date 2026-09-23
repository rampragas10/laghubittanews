import AdminShell from "@/components/admin/AdminShell";
import NewsForm from "@/components/admin/NewsForm";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

export default async function NewNewsPage(){
  await connectDB();
  const categories=await Category.find({isActive:true}).sort({name:1}).lean();
  return <AdminShell title="Create News"><NewsForm categories={categories.map(c=>({...c,_id:String(c._id)}))}/></AdminShell>;
}