import Link from "next/link";
import LogoutButton from "./LogoutButton";

export default function AdminShell({ title, children }) {
  return (
    <div className="min-h-screen bg-[#eff4ff]">
      <header className="bg-[#27313f]  text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-8">
          <Link href="/admin" className="text-xl font-bold text-[#8cf9a9]">Laghubitta CMS</Link>
          <LogoutButton />
        </div>
      </header>
      <div className="mx-auto grid max-w-7xl  grid-cols-1 gap-6 px-4 py-6 md:grid-cols-[220px_1fr] md:px-8">
        <aside className="rounded-xl bg-white p-4 shadow-sm max-h-[calc(100vh-100px)] overflow-y-auto">
          <nav className="space-y-1 text-sm font-semibold">
            <Link className="block rounded-lg p-3 hover:bg-[#eff4ff]" href="/admin">Dashboard</Link>
            <Link className="block rounded-lg p-3 hover:bg-[#eff4ff]" href="/admin/news">News</Link>
            <Link className="block rounded-lg p-3 hover:bg-[#eff4ff]" href="/admin/news/new">Create News</Link>
            <Link className="block rounded-lg p-3 hover:bg-[#eff4ff]" href="/admin/categories">Categories</Link>
            <Link className="block rounded-lg p-3 hover:bg-[#eff4ff]" href="/">View Website</Link>
          </nav>
        </aside>
        <main>
          <h1 className="mb-5 text-2xl font-bold">{title}</h1>
          {children}
        </main>
      </div>
    </div>
  );
}