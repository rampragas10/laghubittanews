import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import News from "@/models/News";
import { requireAdmin } from "@/lib/admin-api";
import { fail, ok } from "@/lib/api";

export async function DELETE(req,{params}){
  if(!await requireAdmin())return fail("Unauthorized",401);
  await connectDB(); const {id}=await params;
  if(await News.exists({category:id}))return fail("Category is in use by news. Move or delete those news first.",409);
  const d=await Category.findByIdAndDelete(id); if(!d)return fail("Category not found",404);
  return ok({deleted:true});
}