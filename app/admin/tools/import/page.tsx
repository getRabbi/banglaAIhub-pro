"use client";
import { useState } from "react";
import Link from "next/link";

export default function BulkImport() {
  const [csv, setCsv] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const handleImport = async () => {
    setLoading(true); setResult("");
    const res = await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "bulk_import_tools", csv }) });
    const d = await res.json();
    setResult(d.ok ? `✅ ${d.count} tools imported!` : `❌ ${d.error || "Import failed"}`);
    setLoading(false);
  };

  return (
    <div>
      <Link href="/admin/tools" className="text-xs text-gray-500 hover:text-gray-300 mb-2 block">← Tools</Link>
      <h1 className="text-2xl font-bold text-white mb-4">📥 Bulk CSV Import</h1>
      <div className="glass-card p-5 mb-4">
        <p className="text-sm text-gray-400 mb-3">CSV format: <code className="text-brand-electric">name,slug,tagline_bn,pricing,website_url,tracked_url,category_id</code></p>
        <textarea value={csv} onChange={e => setCsv(e.target.value)} rows={12} placeholder="ChatGPT,chatgpt,AI চ্যাটবট,freemium,https://chat.openai.com,,1" className="w-full px-3 py-2 rounded-lg bg-brand-navy border border-brand-border text-white font-mono text-sm resize-y focus:outline-none focus:border-brand-blue/50" />
      </div>
      <div className="flex items-center gap-3">
        <button onClick={handleImport} disabled={loading || !csv.trim()} className="btn-primary">{loading ? "Importing..." : "📥 Import"}</button>
        {result && <span className="text-sm">{result}</span>}
      </div>
    </div>
  );
}
