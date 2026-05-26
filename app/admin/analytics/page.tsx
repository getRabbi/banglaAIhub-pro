import { createServerClient } from "@/lib/supabase";
import { BLOG_CATEGORIES } from "@/lib/constants";
export const revalidate = 300;
export default async function AdminAnalytics() {
  const sb = createServerClient();
  const [{ data: blogs }, { data: tools }, { count: clicks30 }, { data: topPosts }, { data: topTools }] = await Promise.all([
    sb.from("blog_posts").select("category, view_count, source").eq("status", "published"),
    sb.from("tools").select("view_count, click_count").eq("is_active", true),
    sb.from("affiliate_clicks").select("id", { count: "exact", head: true }).gte("clicked_at", new Date(Date.now() - 30 * 86400000).toISOString()),
    sb.from("blog_posts").select("bangla_title, blog_slug, view_count, category").eq("status", "published").order("view_count", { ascending: false }).limit(10),
    sb.from("tools").select("name, slug, view_count, click_count").eq("is_active", true).order("click_count", { ascending: false }).limit(10),
  ]);
  const bp = blogs || []; const tl = tools || [];
  const totalViews = bp.reduce((s, p: any) => s + (p.view_count || 0), 0);
  const toolViews = tl.reduce((s, t: any) => s + (t.view_count || 0), 0);
  const toolClicks = tl.reduce((s, t: any) => s + (t.click_count || 0), 0);
  const catStats: Record<string, { count: number; views: number }> = {};
  bp.forEach((p: any) => { if (!catStats[p.category]) catStats[p.category] = { count: 0, views: 0 }; catStats[p.category].count++; catStats[p.category].views += p.view_count || 0; });
  const srcStats: Record<string, number> = {};
  bp.forEach((p: any) => { srcStats[p.source] = (srcStats[p.source] || 0) + 1; });

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">📈 Analytics</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { l: "Blog Views", v: totalViews, c: "text-blue-400" },
          { l: "Tool Views", v: toolViews, c: "text-violet-400" },
          { l: "Tracked Clicks", v: toolClicks, c: "text-amber-400" },
          { l: "Clicks (30d)", v: clicks30 || 0, c: "text-green-400" },
        ].map(s => (
          <div key={s.l} className="glass-card p-4"><p className={`text-2xl font-bold ${s.c}`}>{s.v.toLocaleString()}</p><p className="text-xs text-gray-500">{s.l}</p></div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">📂 Category Breakdown</h2>
          {Object.entries(catStats).map(([cat, s]) => {
            const c = BLOG_CATEGORIES[cat as keyof typeof BLOG_CATEGORIES];
            return <div key={cat} className="flex items-center justify-between py-2 border-b border-brand-border/50 last:border-0"><span className="text-sm text-gray-300">{c?.emoji} {c?.label || cat}</span><span className="text-sm text-gray-400">{s.count} posts · {s.views} views</span></div>;
          })}
        </div>
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">📡 Source Breakdown</h2>
          {Object.entries(srcStats).sort((a, b) => b[1] - a[1]).map(([src, count]) => (
            <div key={src} className="flex items-center justify-between py-2 border-b border-brand-border/50 last:border-0"><span className="text-sm text-gray-300">{src}</span><span className="text-sm text-gray-400">{count} posts</span></div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">🔥 Top Blog Posts</h2>
          {(topPosts || []).map((p: any, i: number) => (
            <div key={p.blog_slug} className="flex items-center gap-3 py-2 border-b border-brand-border/50 last:border-0">
              <span className="text-lg font-bold text-white/10 w-6">{i + 1}</span>
              <div className="flex-1 min-w-0"><p className="text-sm text-gray-300 truncate">{p.bangla_title}</p></div>
              <span className="text-sm text-gray-400 shrink-0">{p.view_count} views</span>
            </div>
          ))}
        </div>
        <div className="glass-card p-5">
          <h2 className="font-semibold text-white mb-4">🛠️ Top Tools (by clicks)</h2>
          {(topTools || []).map((t: any, i: number) => (
            <div key={t.slug} className="flex items-center gap-3 py-2 border-b border-brand-border/50 last:border-0">
              <span className="text-lg font-bold text-white/10 w-6">{i + 1}</span>
              <div className="flex-1 min-w-0"><p className="text-sm text-gray-300">{t.name}</p></div>
              <span className="text-sm text-gray-400 shrink-0">{t.click_count} clicks · {t.view_count} views</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
