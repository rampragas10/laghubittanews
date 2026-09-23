import { cookies } from "next/headers";
import { ok } from "@/lib/api";

export async function POST(){
  const jar=await cookies();
  jar.set("admin_token","",{httpOnly:true,expires:new Date(0),path:"/"});
  return ok({loggedOut:true});
}