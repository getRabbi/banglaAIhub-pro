import { createServerClient } from "@/lib/supabase";
import Link from "next/link";

export const revalidate = 300; // 5 min

export default async function AdminDashboard() {
  const sb = createServerClient();
  const [{ count: totalPosts }, { count: totalTools }, { count: totalSubs }, { data: recentPosts }, { data: recentJobs }, { count: pendingQueue }] = await Promise.all([
    sb.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
    sb.from("tools").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("newsletter_subscribers").select("*", { count: "exact", head: true }).eq("is_active", true),
    sb.from("blog_posts").select("id, bangla_title, blog_slug, category, view_count, fb_posted, published_at").eq("status", "published").order("published_at", { ascending: false }).limit(5),
    sb.from("openclaw_jobs").select("id, status, stats, started_at, completed_at").order("started_at", { ascending: false }).limit(5),
    sb.from("scrape_queue").select("id", { count: "exact", head: true }).eq("status", "pending"),
  ]);

  // Aggregate views
  const { data: viewData } = await sb.from("blog_posts").select("view_count").eq("status", "published");
  const totalViews = (viewData || []).reduce((s: number, p: any) => s + (p.view_count || 0), 0);

  // Affiliate clicks last 30d
  const { count: affClicks } = await sb.from("affiliate_clicks").select("*", { count: "exact", head: true }).gte("clicked_at", new Date(Date.now() - 30 * 86400000).toISOString());

  const stats = [
    { label: "মোট পোস্ট", value: totalPosts || 0, icon: "📝", color: "text-blue-400", href: "/admin/posts" },
    { label: "মোট টুলস", value: totalTools || 0, icon: "🛠️", color: "text-violet-400", href: "/admin/tools" },
    { label: "মোট ভিউ", value: totalViews, icon: "👁", color: "text-green-400", href: "/admin/analytics" },
    { label: "Affiliate Clicks (30d)", value: affClicks || 0, icon: "🔗", color: "text-amber-400", href: "/admin/affiliate-links" },
    { label: "সাবস্ক্রাইবার", value: totalSubs || 0, icon: "📧", color: "text-pink-400", href: "/admin/newsletter" },
    { label: "Pending Queue", value: pendingQueue || 0, icon: "🤖", color: "text-orange-400", href: "/admin/scrape-queue" },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-white">📊 Dashboard</h1>
        <Link href="/admin/quick-submit" className="px-4 py-2 rounded-xl bg-brand-orange hover:bg-orange-500 text-white text-sm font-semibold transition-all">⚡ Quick Submit</Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="glass-card p-4 card-hover">
            <span className="text-2xl block mb-1">{s.icon}</span>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value.toLocaleString()}</p>
            <p className="text-xs text-gray-500 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Posts */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">📝 সর্বশেষ পোস্ট</h2>
            <Link href="/admin/posts" className="text-xs text-brand-electric hover:underline">সব →</Link>
          </div>
          <div className="space-y-3">
            {(recentPosts || []).map((p: any) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                <div className="min-w-0 flex-1">
                  <Link href={`/admin/posts/${p.id}`} className="text-sm text-gray-300 hover:text-white truncate block">{p.bangla_title}</Link>
                  <p className="text-xs text-gray-600">{new Date(p.published_at).toLocaleDateString("bn-BD")} · 👁 {p.view_count}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ml-2 ${p.fb_posted ? "bg-green-500/20 text-green-400" : "bg-yellow-500/20 text-yellow-400"}`}>
                  {p.fb_posted ? "FB ✓" : "FB ⏳"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Jobs */}
        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-white">🔁 OpenClaw Jobs</h2>
            <Link href="/admin/openclaw-jobs" className="text-xs text-brand-electric hover:underline">সব →</Link>
          </div>
          <div className="space-y-3">
            {(recentJobs || []).map((j: any) => {
              const s = j.stats || {};
              return (
                <div key={j.id} className="flex items-center justify-between py-2 border-b border-brand-border last:border-0">
                  <div>
                    <p className="text-sm text-gray-300">Job #{j.id}</p>
                    <p className="text-xs text-gray-600">{new Date(j.started_at).toLocaleString("bn-BD")}</p>
                  </div>
                  <div className="text-right">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${j.status === "completed" ? "bg-green-500/20 text-green-400" : j.status === "failed" ? "bg-red-500/20 text-red-400" : "bg-blue-500/20 text-blue-400"}`}>{j.status}</span>
                    {s.published !== undefined && <p className="text-xs text-gray-600 mt-1">{s.published || 0} published</p>}
                  </div>
                </div>
              );
            })}
            {(!recentJobs || recentJobs.length === 0) && <p className="text-sm text-gray-600">কোনো job চালানো হয়নি</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
