import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import { connectDB } from "@/lib/db";
import Admin from "@/models/Admin";
import { createAdminToken } from "@/lib/auth";
import { fail, ok } from "@/lib/api";

export async function POST(req){
  try{
    const {email,password}=await req.json();
    if(!email||!password)return fail("Email and password are required",400);
    await connectDB();
    const admin=await Admin.findOne({email:email.toLowerCase(),isActive:true});
    if(!admin || !(await bcrypt.compare(password,admin.passwordHash))) return fail("Invalid credentials",401);
    const token=await createAdminToken(admin);
    const jar=await cookies();
    jar.set("admin_token",token,{httpOnly:true,secure:process.env.NODE_ENV==="production",sameSite:"lax",path:"/",maxAge:60*60*24*7});
    return ok({admin:{id:String(admin._id),name:admin.name,email:admin.email}});
  }catch(e){return fail("Login failed",500);}
}