import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { requireAdmin } from "@/lib/admin-api";
import { fail, ok } from "@/lib/api";
import { makeSlug } from "@/lib/slug";

export async function GET(){if(!await requireAdmin())return fail("Unauthorized",401); await connectDB(); return ok(await Category.find().sort({name:1}).lean());}
export async function POST(req){
  if(!await requireAdmin())return fail("Unauthorized",401);
  try{
    const {name,description=""}=await req.json(); if(!name)return fail("Name is required",400);
    await connectDB(); const slug=makeSlug(name); if(await Category.exists({slug}))return fail("Category already exists",409);
    return ok(await Category.create({name,slug,description}),201);
  }catch(e){return fail(e.message,400);}
}