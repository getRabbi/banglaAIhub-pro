"use client";
import { useState } from "react";

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-400",
  approved: "bg-green-500/20 text-green-400",
  rejected: "bg-red-500/20 text-red-400",
  published: "bg-blue-500/20 text-blue-400",
};

export default function ScrapeQueueClient({ items: initial }: { items: any[] }) {
  const [items, setItems] = useState(initial);

  const handleAction = async (id: number, status: string) => {
    await fetch("/api/admin", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "update_scrape_queue", id, data: { status } }) });
    setItems(items.map(i => i.id === id ? { ...i, status } : i));
  };

  const pending = items.filter(i => i.status === "pending");
  const others = items.filter(i => i.status !== "pending");

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">🤖 Scrape Queue</h1>
      <p className="text-gray-400 mb-6">OpenClaw যা collect করেছে — approve করলে blog publish হবে</p>

      {pending.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4">⏳ Pending ({pending.length})</h2>
          <div className="space-y-3">
            {pending.map((item) => (
              <div key={item.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-3">{item.body?.slice(0, 200)}...</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-600">
                      <span>📡 {item.source}</span>
                      <span>📊 Score: {item.engagement_score}</span>
                      <span>{new Date(item.created_at).toLocaleDateString("bn-BD")}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => handleAction(item.id, "approved")} className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-400 text-xs font-medium hover:bg-green-500/30">✓ Approve</button>
                    <button onClick={() => handleAction(item.id, "rejected")} className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 text-xs font-medium hover:bg-red-500/30">✗ Reject</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {others.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-400 mb-4">📋 History</h2>
          <div className="glass-card overflow-hidden">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Title</th><th className="px-4 py-3">Source</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th></tr></thead>
              <tbody>
                {others.map((item) => (
                  <tr key={item.id} className="border-b border-brand-border/50">
                    <td className="px-4 py-3 text-gray-300 text-xs">{item.title?.slice(0, 60)}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.source}</td>
                    <td className="px-4 py-3 text-xs text-gray-500">{item.engagement_score}</td>
                    <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[item.status]}`}>{item.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {items.length === 0 && <p className="text-center text-gray-500 py-16">Queue খালি — OpenClaw pipeline run করুন</p>}
    </div>
  );
}
