import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { PRICING_LABELS, BADGE_LABELS } from "@/lib/constants";

export const revalidate = 60;

export default async function AdminTools() {
  const { data: tools } = await createServerClient().from("tools").select("id, name, slug, pricing, badge, category_id, view_count, click_count, is_active, is_featured, created_at, categories(name_bn)").order("created_at", { ascending: false }).limit(100);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">🛠️ Tools Manager</h1>
        <div className="flex gap-2">
          <Link href="/admin/tools/import" className="btn-secondary text-sm">📥 CSV Import</Link>
          <Link href="/admin/tools/new" className="btn-primary text-sm">+ Add Tool</Link>
        </div>
      </div>

      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium">Pricing</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Badge</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Clicks</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(tools || []).map((t: any) => (
              <tr key={t.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3">
                  <p className="text-gray-200 font-medium">{t.name}</p>
                  <p className="text-xs text-gray-600">/{t.slug}</p>
                </td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{t.categories?.name_bn || "-"}</td>
                <td className="px-4 py-3">{t.pricing && PRICING_LABELS[t.pricing] ? <span className={`text-xs px-2 py-0.5 rounded-full border ${PRICING_LABELS[t.pricing].color}`}>{PRICING_LABELS[t.pricing].label}</span> : "-"}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs">{t.badge && BADGE_LABELS[t.badge] ? `${BADGE_LABELS[t.badge].icon} ${BADGE_LABELS[t.badge].label}` : "-"}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{t.view_count}</td>
                <td className="px-4 py-3 hidden md:table-cell text-xs text-gray-500">{t.click_count}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${t.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{t.is_active ? "Active" : "Inactive"}</span>
                  {t.is_featured && <span className="text-xs text-amber-400 ml-1">⭐</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <Link href={`/admin/tools/${t.id}`} className="text-xs text-brand-electric hover:underline">Edit</Link>
                    <Link href={`/tools/${t.slug}`} target="_blank" className="text-xs text-gray-500 hover:text-gray-300">View</Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!tools || tools.length === 0) && <p className="text-center text-gray-600 py-10">কোনো টুল নেই। Add Tool ক্লিক করুন।</p>}
      </div>
    </div>
  );
}
