"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

export default function EditPost() {
  const { id } = useParams();
  const router = useRouter();
  const [post, setPost] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch(`/api/admin?action=get_post&id=${id}`).then(r => r.json()).then(d => setPost(d)).catch(() => {});
  }, [id]);

  const handleSave = async () => {
    setSaving(true);
    setMsg("");
    try {
      const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_post", id, data: post }) });
      const d = await res.json();
      setMsg(d.ok ? "✅ সেভ হয়েছে!" : "❌ সেভ ব্যর্থ");
    } catch { setMsg("❌ Error"); }
    setSaving(false);
  };

  if (!post) return <div className="py-20 text-center text-gray-500">লোড হচ্ছে...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <Link href="/admin/posts" className="text-xs text-gray-500 hover:text-gray-300 mb-2 block">← Posts</Link>
          <h1 className="text-xl font-bold text-white">Edit Post #{id}</h1>
        </div>
        <div className="flex gap-2 items-center">
          {msg && <span className="text-sm">{msg}</span>}
          <Link href={`/blog/${post.blog_slug}`} target="_blank" className="btn-secondary text-sm">👁 Preview</Link>
          <button onClick={handleSave} disabled={saving} className="btn-primary text-sm">{saving ? "Saving..." : "💾 Save"}</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6">
        {/* Main */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Title</label>
            <input value={post.bangla_title || ""} onChange={e => setPost({ ...post, bangla_title: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50" />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Hook (Facebook)</label>
            <textarea value={post.bangla_hook || ""} onChange={e => setPost({ ...post, bangla_hook: e.target.value })} rows={3} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 resize-none" />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Body (Markdown)</label>
            <textarea value={post.bangla_body || ""} onChange={e => setPost({ ...post, bangla_body: e.target.value })} rows={20} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 font-mono text-sm resize-y" />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Meta Description</label>
            <textarea value={post.meta_description || ""} onChange={e => setPost({ ...post, meta_description: e.target.value })} rows={2} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50 resize-none" />
            <p className="text-xs text-gray-600 mt-1">{(post.meta_description || "").length}/155</p>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Status</label>
            <select value={post.status || "draft"} onChange={e => setPost({ ...post, status: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white">
              <option value="draft">Draft</option>
              <option value="published">Published</option>
              <option value="scheduled">Scheduled</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {post.status === "scheduled" && (
            <div className="glass-card p-4">
              <label className="text-xs text-gray-500 block mb-1">Schedule Date</label>
              <input type="datetime-local" value={post.scheduled_at?.slice(0, 16) || ""} onChange={e => setPost({ ...post, scheduled_at: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white" />
            </div>
          )}

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Category</label>
            <select value={post.category || "tech-news"} onChange={e => setPost({ ...post, category: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white">
              <option value="money-making">💰 অনলাইন আয়</option>
              <option value="ai-tools">🤖 AI টুলস</option>
              <option value="tech-news">📡 টেক নিউজ</option>
              <option value="product-review">🚀 প্রোডাক্ট রিভিউ</option>
            </select>
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Slug</label>
            <input value={post.blog_slug || ""} onChange={e => setPost({ ...post, blog_slug: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-gray-400 text-sm" />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Tags (comma separated)</label>
            <input value={(post.tags || []).join(", ")} onChange={e => setPost({ ...post, tags: e.target.value.split(",").map((t: string) => t.trim()).filter(Boolean) })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm" />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs text-gray-500 block mb-1">Thumbnail URL</label>
            <input value={post.thumbnail_url || ""} onChange={e => setPost({ ...post, thumbnail_url: e.target.value })} className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white text-sm" placeholder="https://images.unsplash.com/..." />
          </div>

          <div className="glass-card p-4 text-xs text-gray-600 space-y-1">
            <p>Quality: <span className="text-gray-400">{post.quality_grade} ({post.quality_score})</span></p>
            <p>Views: <span className="text-gray-400">{post.view_count}</span></p>
            <p>FB: <span className={post.fb_posted ? "text-green-400" : "text-gray-500"}>{post.fb_posted ? "✓ Posted" : "Not posted"}</span></p>
            <p>Source: <span className="text-gray-400">{post.source}</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
