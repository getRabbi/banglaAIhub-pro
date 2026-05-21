"use client";
import { useEffect, useState } from "react";

export default function AdminCategories() {
  const [cats, setCats] = useState<any[]>([]);
  const [editing, setEditing] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  const load = () => fetch("/api/admin?action=get_categories").then(r => r.json()).then(d => setCats(d || []));
  useEffect(() => { load(); }, []);

  const handleSave = async (cat: any) => {
    setSaving(true);
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: cat.id ? "update_category" : "create_category", id: cat.id, data: cat }) });
    setSaving(false); setEditing(null); load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">📂 Categories</h1>
        <button onClick={() => setEditing({ name: "", name_bn: "", slug: "", icon: "📂", color: "#3b82f6", description_bn: "", sort_order: 0, is_active: true })} className="btn-primary text-sm">+ Add</button>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Icon</th><th className="px-4 py-3">Name BN</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Tools</th><th className="px-4 py-3">Order</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {cats.map((c: any) => (
              <tr key={c.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-xl">{c.icon}</td>
                <td className="px-4 py-3 text-gray-200">{c.name_bn}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.slug}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.tool_count}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{c.sort_order}</td>
                <td className="px-4 py-3"><button onClick={() => setEditing(c)} className="text-xs text-brand-electric hover:underline">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={() => setEditing(null)}>
          <div className="glass-card p-6 max-w-md w-full space-y-3" onClick={e => e.stopPropagation()}>
            <h2 className="text-lg font-bold text-white">{editing.id ? "Edit" : "Add"} Category</h2>
            {[{ l: "Name EN", k: "name" }, { l: "Name BN", k: "name_bn" }, { l: "Slug", k: "slug" }, { l: "Icon (emoji)", k: "icon" }, { l: "Color", k: "color" }, { l: "Description BN", k: "description_bn" }, { l: "Sort Order", k: "sort_order" }].map(({ l, k }) => (
              <div key={k}><label className="text-xs text-gray-500">{l}</label><input value={editing[k] ?? ""} onChange={e => setEditing({ ...editing, [k]: k === "sort_order" ? Number(e.target.value) : e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm" /></div>
            ))}
            <div className="flex gap-2 pt-2">
              <button onClick={() => handleSave(editing)} disabled={saving} className="btn-primary text-sm flex-1">{saving ? "Saving..." : "Save"}</button>
              <button onClick={() => setEditing(null)} className="btn-secondary text-sm flex-1">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
