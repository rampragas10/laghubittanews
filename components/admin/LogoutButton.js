 "use client";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", {method:"POST"});
    router.push("/admin/login");
    router.refresh();
  }
  return <button onClick={logout} className="rounded-lg bg-white/10 px-4 py-2 text-sm hover:bg-white/20">Logout</button>;
}