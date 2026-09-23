import { cookies } from "next/headers";
import { verifyAdminToken } from "./auth";

export async function requireAdmin(){
  const token=(await cookies()).get("admin_token")?.value;
  const admin=await verifyAdminToken(token);
  return admin;
}