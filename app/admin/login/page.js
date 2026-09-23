 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: {"Content-Type":"application/json"},
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) return setError(data.error?.message || "Login failed");
    router.push("/admin");
    router.refresh();
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#eff4ff] px-4">
      <form onSubmit={submit} className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-[#005b37]">Admin Login</h1>
        <p className="mt-2 text-sm text-gray-500">Laghubitta News CMS</p>
        <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="Email" required className="mt-6 w-full rounded-lg border p-3" />
        <input value={password} onChange={e=>setPassword(e.target.value)} type="password" placeholder="Password" required className="mt-3 w-full rounded-lg border p-3" />
        {error && <p className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        <button className="mt-5 w-full rounded-lg bg-[#005b37] p-3 font-bold text-white">Login</button>
      </form>
    </main>
  );
}