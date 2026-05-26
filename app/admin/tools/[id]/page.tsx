"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function ToolForm() {
  const params = useParams();
  const router = useRouter();
  const isNew = !params.id || params.id === "new";
  const [tool, setTool] = useState<any>({ name: "", slug: "", tagline: "", tagline_bn: "", description_bn: "", pricing: "free", badge: "", website_url: "", affiliate_url: "", affiliate_slug: "", logo_url: "", category_id: null, features_bn: [], pros: [], cons: [], faq: [], is_active: true, is_featured: false });
  const [cats, setCats] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/admin?action=get_categories").then(r => r.json()).then(d => setCats(d || []));
    if (!isNew) fetch(`/api/admin?action=get_tool&id=${params.id}`).then(r => r.json()).then(d => { if (d?.id) setTool(d); });
  }, [isNew, params.id]);

  const handleSave = async () => {
    setSaving(true);
    const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: isNew ? "create_tool" : "update_tool", id: params.id, data: tool }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { setMsg("✅ সেভ হয়েছে!"); if (isNew && d.id) router.push(`/admin/tools/${d.id}`); }
    else setMsg("❌ ব্যর্থ");
  };

  const f = (key: string, val: any) => setTool({ ...tool, [key]: val });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div><Link href="/admin/tools" className="text-xs text-gray-500 hover:text-gray-300 block mb-1">← Tools</Link><h1 className="text-xl font-bold text-white">{isNew ? "➕ Add Tool" : `Edit: ${tool.name}`}</h1></div>
        <div className="flex gap-2 items-center">{msg && <span className="text-sm">{msg}</span>}<button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "💾 Save"}</button></div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {[
          { label: "Name", key: "name", type: "text" },
          { label: "Slug", key: "slug", type: "text" },
          { label: "Tagline (EN)", key: "tagline", type: "text" },
          { label: "Tagline (BN)", key: "tagline_bn", type: "text" },
          { label: "Website URL", key: "website_url", type: "text" },
          { label: "Tracked URL", key: "affiliate_url", type: "text" },
          { label: "Tracking Slug (/go/xxx)", key: "affiliate_slug", type: "text" },
          { label: "Logo URL", key: "logo_url", type: "text" },
        ].map(({ label, key, type }) => (
          <div key={key} className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">{label}</label>
            <input type={type} value={tool[key] || ""} onChange={e => f(key, e.target.value)} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 text-sm" />
          </div>
        ))}

        <div className="glass-card p-4">
          <label className="text-xs text-gray-500 block mb-1">Category</label>
          <select value={tool.category_id || ""} onChange={e => f("category_id", e.target.value ? Number(e.target.value) : null)} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white">
            <option value="">— নির্বাচন করুন —</option>
            {cats.map((c: any) => <option key={c.id} value={c.id}>{c.icon} {c.name_bn}</option>)}
          </select>
        </div>

        <div className="glass-card p-4">
          <label className="text-xs text-gray-500 block mb-1">Pricing</label>
          <select value={tool.pricing} onChange={e => f("pricing", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white">
            <option value="free">Free</option><option value="freemium">Freemium</option><option value="paid">Paid</option><option value="enterprise">Enterprise</option>
          </select>
        </div>

        <div className="glass-card p-4">
          <label className="text-xs text-gray-500 block mb-1">Badge</label>
          <select value={tool.badge} onChange={e => f("badge", e.target.value)} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white">
            <option value="">None</option><option value="editors-choice">Editor&apos;s Choice</option><option value="trending">Trending</option><option value="new">New</option><option value="popular">Popular</option><option value="best-value">Best Value</option>
          </select>
        </div>

        <div className="glass-card p-4 flex gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={tool.is_active} onChange={e => f("is_active", e.target.checked)} className="rounded" /> Active</label>
          <label className="flex items-center gap-2 text-sm text-gray-300"><input type="checkbox" checked={tool.is_featured} onChange={e => f("is_featured", e.target.checked)} className="rounded" /> Featured</label>
        </div>
      </div>

      <div className="glass-card p-4 mt-4">
        <label className="text-xs text-gray-500 block mb-1">Description (BN)</label>
        <textarea value={tool.description_bn || ""} onChange={e => f("description_bn", e.target.value)} rows={8} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 text-sm resize-y" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div className="glass-card p-4">
          <label className="text-xs text-gray-500 block mb-1">Features BN (one per line)</label>
          <textarea value={(tool.features_bn || []).join("\n")} onChange={e => f("features_bn", e.target.value.split("\n").filter(Boolean))} rows={5} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm resize-y" />
        </div>
        <div className="glass-card p-4">
          <label className="text-xs text-gray-500 block mb-1">Pros (one per line)</label>
          <textarea value={(tool.pros || []).join("\n")} onChange={e => f("pros", e.target.value.split("\n").filter(Boolean))} rows={5} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm resize-y" />
        </div>
      </div>
    </div>
  );
}
