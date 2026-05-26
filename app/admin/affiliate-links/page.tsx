import { createServerClient } from "@/lib/supabase";

export const revalidate = 120;

export default async function AdminAffiliateLinks() {
  const sb = createServerClient();
  const { data: links } = await sb.from("affiliate_links").select("*, tools(name)").order("click_count", { ascending: false });

  // Last 30 day clicks per link
  const { data: recentClicks } = await sb.from("affiliate_clicks").select("link_id").gte("clicked_at", new Date(Date.now() - 30 * 86400000).toISOString());
  const clickMap: Record<number, number> = {};
  (recentClicks || []).forEach((c: any) => { clickMap[c.link_id] = (clickMap[c.link_id] || 0) + 1; });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">🔗 Tracked Links</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Tool</th><th className="px-4 py-3">Slug (/go/xxx)</th><th className="px-4 py-3">Total Clicks</th><th className="px-4 py-3">Last 30d</th><th className="px-4 py-3">Active</th></tr></thead>
          <tbody>
            {(links || []).map((l: any) => (
              <tr key={l.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-gray-200">{l.tools?.name || "-"}</td>
                <td className="px-4 py-3 text-xs font-mono text-brand-electric">/go/{l.slug}</td>
                <td className="px-4 py-3 text-gray-300 font-bold">{l.click_count}</td>
                <td className="px-4 py-3 text-amber-400 font-bold">{clickMap[l.id] || 0}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${l.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{l.is_active ? "Active" : "Off"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!links || links.length === 0) && <p className="text-center text-gray-600 py-10">কোনো tracked link নেই</p>}
      </div>
    </div>
  );
}
