import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { ok, fail } from "@/lib/api";

export async function POST(req,{params}){
  await connectDB(); const {slug}=await params;
  const news=await News.findOneAndUpdate({slug,status:"published"},{$inc:{views:1}},{new:true}).select("views");
  if(!news)return fail("News not found",404);
  return ok({views:news.views});
}