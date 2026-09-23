import { connectDB } from "@/lib/db";
import News from "@/models/News";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/admin-api";
import { fail, ok } from "@/lib/api";
import { makeSlug } from "@/lib/slug";

export async function GET(){
  if(!await requireAdmin())return fail("Unauthorized",401);
  await connectDB();
  return ok(await News.find().populate("category").sort({createdAt:-1}).lean());
}

export async function POST(req){
  if(!await requireAdmin())return fail("Unauthorized",401);
  try{
    const body=await req.json();
    if(!body.title||!body.content||!body.category)return fail("title, content and category are required",400);
    await connectDB();
    const category=await Category.findById(body.category);
    if(!category)return fail("Category not found",404);
    let slug=makeSlug(body.title);
    if(await News.exists({slug}))slug=`${slug}-${Date.now()}`;
    const news=await News.create({...body,slug,publishedAt:body.status==="published"?new Date():null});
    return ok(news,201);
  }catch(e){return fail(e.message,400);}
}