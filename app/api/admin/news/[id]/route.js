import { connectDB } from "@/lib/db";
import News from "@/models/News";
import { requireAdmin } from "@/lib/admin-api";
import { fail, ok } from "@/lib/api";
import { makeSlug } from "@/lib/slug";

export async function PUT(req,{params}){
  if(!await requireAdmin())return fail("Unauthorized",401);
  try{
    const {id}=await params; const body=await req.json(); await connectDB();
    const current=await News.findById(id); if(!current)return fail("News not found",404);
    if(body.title && body.title!==current.title) body.slug=makeSlug(body.title)+"-"+Date.now();
    if(body.status==="published" && current.status!=="published")body.publishedAt=new Date();
    if(body.status!=="published")body.publishedAt=null;
    const updated=await News.findByIdAndUpdate(id,body,{new:true,runValidators:true}).populate("category");
    return ok(updated);
  }catch(e){return fail(e.message,400);}
}

export async function DELETE(req,{params}){
  if(!await requireAdmin())return fail("Unauthorized",401);
  await connectDB(); const {id}=await params; const deleted=await News.findByIdAndDelete(id);
  if(!deleted)return fail("News not found",404);
  return ok({deleted:true});
}