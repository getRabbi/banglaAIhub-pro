import { createServerClient } from "@/lib/supabase";
export const revalidate = 120;
export default async function AdminNewsletter() {
  const sb = createServerClient();
  const { data: subs, count } = await sb.from("newsletter_subscribers").select("*", { count: "exact" }).order("subscribed_at", { ascending: false }).limit(100);
  const activeCount = (subs || []).filter((s: any) => s.is_active).length;
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-2">📧 Newsletter</h1>
      <div className="flex gap-4 mb-6">
        <div className="glass-card px-4 py-3"><p className="text-2xl font-bold text-green-400">{activeCount}</p><p className="text-xs text-gray-500">Active</p></div>
        <div className="glass-card px-4 py-3"><p className="text-2xl font-bold text-gray-400">{(count || 0) - activeCount}</p><p className="text-xs text-gray-500">Unsubscribed</p></div>
        <div className="glass-card px-4 py-3"><p className="text-2xl font-bold text-blue-400">{count || 0}</p><p className="text-xs text-gray-500">Total</p></div>
      </div>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Email</th><th className="px-4 py-3">Name</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Date</th></tr></thead>
          <tbody>
            {(subs || []).map((s: any) => (
              <tr key={s.id} className="border-b border-brand-border/50">
                <td className="px-4 py-3 text-gray-200">{s.email}</td>
                <td className="px-4 py-3 text-gray-500 text-xs">{s.name || "-"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${s.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{s.is_active ? "Active" : "Unsub"}</span></td>
                <td className="px-4 py-3 text-xs text-gray-600">{new Date(s.subscribed_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
