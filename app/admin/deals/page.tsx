import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
export const revalidate = 120;
export default async function AdminDeals() {
  const { data: deals } = await createServerClient().from("deals").select("*, tools(name)").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">🔥 Deals Manager</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Title</th><th className="px-4 py-3">Tool</th><th className="px-4 py-3">Discount</th><th className="px-4 py-3">Coupon</th><th className="px-4 py-3">Clicks</th><th className="px-4 py-3">Expires</th><th className="px-4 py-3">Active</th></tr></thead>
          <tbody>
            {(deals || []).map((d: any) => (
              <tr key={d.id} className="border-b border-brand-border/50">
                <td className="px-4 py-3 text-gray-200">{d.title_bn}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{d.tools?.name || "-"}</td>
                <td className="px-4 py-3 text-xs text-red-400">{d.discount_text || "-"}</td>
                <td className="px-4 py-3 text-xs font-mono text-brand-electric">{d.coupon_code || "-"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{d.click_count}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{d.expires_at ? new Date(d.expires_at).toLocaleDateString() : "-"}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${d.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{d.is_active ? "Yes" : "No"}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!deals || deals.length === 0) && <p className="text-center text-gray-600 py-10">কোনো deal নেই</p>}
      </div>
    </div>
  );
}
