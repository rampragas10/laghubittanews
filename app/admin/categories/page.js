 "use client";
import { useEffect,useState } from "react";
import AdminShell from "@/components/admin/AdminShell";

export default function CategoriesPage(){
  const [categories,setCategories]=useState([]); const [name,setName]=useState(""); const [description,setDescription]=useState("");
  async function load(){const r=await fetch("/api/admin/categories"); const d=await r.json(); setCategories(d.data||[]);}
  useEffect(()=>{load()},[]);
  async function add(e){e.preventDefault(); const r=await fetch("/api/admin/categories",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({name,description})}); if(r.ok){setName("");setDescription("");load();}}
  async function remove(id){if(!confirm("Delete category?"))return; await fetch(`/api/admin/categories/${id}`,{method:"DELETE"});load();}
  return <AdminShell title="Categories">
    <form onSubmit={add} className="mb-6 rounded-xl bg-white p-5 shadow-sm"><div className="grid gap-3 md:grid-cols-2"><input value={name} onChange={e=>setName(e.target.value)} required placeholder="Category name" className="rounded-lg border p-3"/><input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="rounded-lg border p-3"/></div><button className="mt-3 rounded-lg bg-[#005b37] px-4 py-2 font-bold text-white">Add category</button></form>
    <div className="rounded-xl bg-white p-5 shadow-sm">{categories.map(c=><div key={c._id} className="flex items-center justify-between border-b py-3"><div><b>{c.name}</b><div className="text-xs text-gray-500">{c.slug}</div></div><button onClick={()=>remove(c._id)} className="text-red-600">Delete</button></div>)}</div>
  </AdminShell>;
}