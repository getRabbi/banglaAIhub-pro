"use client";
import { useState } from "react";

export default function QuickSubmit() {
  const [url, setUrl] = useState("");
  const [topic, setTopic] = useState("");
  const [category, setCategory] = useState("ai-tools");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleSubmit = async () => {
    setLoading(true); setResult(null);
    const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "quick_submit", url, topic, category }) });
    const d = await res.json();
    setResult(d);
    setLoading(false);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">⚡ Quick Submit</h1>
      <p className="text-gray-400 mb-6">URL বা topic দিন — AI automatically Bangla blog post তৈরি করে publish করবে</p>

      <div className="glass-card p-6 space-y-4 max-w-2xl">
        <div>
          <label className="text-xs text-gray-500 block mb-1">URL (Reddit/HN/X post link)</label>
          <input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://reddit.com/r/..." className="w-full px-3 py-2.5 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50" />
        </div>
        <div className="text-center text-gray-600 text-sm">— অথবা —</div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Topic (manual)</label>
          <input value={topic} onChange={e => setTopic(e.target.value)} placeholder="How to make money with ChatGPT" className="w-full px-3 py-2.5 rounded-lg bg-brand-navy border border-brand-border text-white focus:outline-none focus:border-brand-blue/50" />
        </div>
        <div>
          <label className="text-xs text-gray-500 block mb-1">Category</label>
          <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2.5 rounded-lg bg-brand-navy border border-brand-border text-white">
            <option value="money-making">💰 অনলাইন আয়</option>
            <option value="ai-tools">🤖 AI টুলস</option>
            <option value="tech-news">📡 টেক নিউজ</option>
            <option value="product-review">🚀 প্রোডাক্ট রিভিউ</option>
          </select>
        </div>
        <button onClick={handleSubmit} disabled={loading || (!url && !topic)} className="btn-primary w-full">
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              AI তৈরি করছে... (30-60 সেকেন্ড)
            </span>
          ) : "🚀 Generate & Publish"}
        </button>
      </div>

      {result && (
        <div className={`glass-card p-5 mt-6 max-w-2xl ${result.ok ? "border-green-500/30" : "border-red-500/30"}`}>
          {result.ok ? (
            <div>
              <p className="text-green-400 font-semibold mb-2">✅ Published!</p>
              <p className="text-gray-300 text-sm mb-1">Title: {result.title}</p>
              <p className="text-gray-500 text-xs mb-1">Quality: {result.quality_grade} ({result.quality_score}/100)</p>
              <p className="text-gray-500 text-xs mb-3">Slug: {result.slug}</p>
              <div className="flex gap-2">
                <a href={`/blog/${result.slug}`} target="_blank" className="btn-secondary text-xs">👁 View Post</a>
                <a href={`/admin/posts/${result.id}`} className="btn-secondary text-xs">✏️ Edit</a>
              </div>
            </div>
          ) : (
            <p className="text-red-400">❌ {result.error || "Failed"}</p>
          )}
        </div>
      )}
    </div>
  );
}
