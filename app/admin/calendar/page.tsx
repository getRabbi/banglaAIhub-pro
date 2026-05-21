import { createServerClient } from "@/lib/supabase";
export const revalidate = 300;
export default async function AdminCalendar() {
  const { data: posts } = await createServerClient().from("blog_posts").select("id, bangla_title, blog_slug, status, category, published_at, scheduled_at").order("published_at", { ascending: false }).limit(60);
  const byDate: Record<string, any[]> = {};
  (posts || []).forEach((p: any) => { const d = (p.published_at || p.scheduled_at || p.created_at)?.split("T")[0]; if (d) { if (!byDate[d]) byDate[d] = []; byDate[d].push(p); } });
  const dates = Object.keys(byDate).sort().reverse();
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">📅 Content Calendar</h1>
      <div className="space-y-4">
        {dates.map(date => (
          <div key={date}>
            <h2 className="text-sm font-semibold text-gray-400 mb-2">{new Date(date).toLocaleDateString("bn-BD", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</h2>
            <div className="space-y-2">
              {byDate[date].map((p: any) => (
                <div key={p.id} className="glass-card p-3 flex items-center justify-between">
                  <div className="min-w-0"><p className="text-sm text-gray-200 truncate">{p.bangla_title}</p><p className="text-xs text-gray-600">{p.category}</p></div>
                  <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${p.status === "published" ? "bg-green-500/20 text-green-400" : p.status === "scheduled" ? "bg-blue-500/20 text-blue-400" : "bg-gray-500/20 text-gray-400"}`}>{p.status}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
        {dates.length === 0 && <p className="text-center text-gray-500 py-16">কোনো কনটেন্ট নেই</p>}
      </div>
    </div>
  );
}
