 "use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewsForm({ initial = {}, categories = [] }) {
  const router = useRouter();
  const [form, setForm] = useState({
    title:"", excerpt:"", content:"", coverImage:"", imageAlt:"", category:"",
    tags:"", status:"draft", featured:false, breaking:false, readTime:3, ...initial,
    tags:Array.isArray(initial.tags)?initial.tags.join(", "):(initial.tags||"")
  });
  const [error,setError]=useState("");
  const [saving,setSaving]=useState(false);

  function set(key,value){setForm(f=>({...f,[key]:value}));}

  async function submit(e){
    e.preventDefault(); setSaving(true); setError("");
    const payload={...form, tags:form.tags.split(",").map(x=>x.trim()).filter(Boolean), readTime:Number(form.readTime)};
    const url=form._id?`/api/admin/news/${form._id}`:"/api/admin/news";
    const res=await fetch(url,{method:form._id?"PUT":"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json();
    setSaving(false);
    if(!res.ok)return setError(data.error?.message||"Save failed");
    router.push("/admin/news"); router.refresh();
  }

  async function remove(){
    if(!form._id || !confirm("Delete this news?")) return;
    const res=await fetch(`/api/admin/news/${form._id}`,{method:"DELETE"});
    if(res.ok){router.push("/admin/news");router.refresh();}
  }

  return <form onSubmit={submit} className="space-y-5 rounded-xl bg-white p-6 shadow-sm">
    <div className="grid gap-4 md:grid-cols-2">
      <label className="md:col-span-2">Title<input value={form.title} onChange={e=>set("title",e.target.value)} required className="mt-1 w-full rounded-lg border p-3"/></label>
      <label>Category<select value={form.category} onChange={e=>set("category",e.target.value)} required className="mt-1 w-full rounded-lg border p-3"><option value="">Select category</option>{categories.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}</select></label>
      <label>Status<select value={form.status} onChange={e=>set("status",e.target.value)} className="mt-1 w-full rounded-lg border p-3"><option value="draft">Draft</option><option value="published">Published</option><option value="archived">Archived</option></select></label>
      <label>Cover image URL<input value={form.coverImage} onChange={e=>set("coverImage",e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
      <label>Image alt text<input value={form.imageAlt} onChange={e=>set("imageAlt",e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
      <label>Read time (minutes)<input type="number" min="1" value={form.readTime} onChange={e=>set("readTime",e.target.value)} className="mt-1 w-full rounded-lg border p-3"/></label>
      <label>Tags<input value={form.tags} onChange={e=>set("tags",e.target.value)} placeholder="finance, microfinance" className="mt-1 w-full rounded-lg border p-3"/></label>
      <label className="md:col-span-2">Excerpt<textarea value={form.excerpt} onChange={e=>set("excerpt",e.target.value)} rows="3" className="mt-1 w-full rounded-lg border p-3"/></label>
      <label className="md:col-span-2">Article HTML<textarea value={form.content} onChange={e=>set("content",e.target.value)} required rows="18" className="mt-1 w-full rounded-lg border p-3 font-mono text-sm" placeholder="<p>Article...</p>"/></label>
    </div>
    <div className="flex flex-wrap gap-5">
      <label className="flex gap-2"><input type="checkbox" checked={form.featured} onChange={e=>set("featured",e.target.checked)}/> Featured</label>
      <label className="flex gap-2"><input type="checkbox" checked={form.breaking} onChange={e=>set("breaking",e.target.checked)}/> Breaking</label>
    </div>
    {error && <div className="rounded-lg bg-red-50 p-3 text-red-700">{error}</div>}
    <div className="flex gap-3">
      <button disabled={saving} className="rounded-lg bg-[#005b37] px-5 py-3 font-bold text-white">{saving?"Saving...":"Save News"}</button>
      {form._id && <button type="button" onClick={remove} className="rounded-lg bg-red-600 px-5 py-3 font-bold text-white">Delete</button>}
    </div>
  </form>;
}