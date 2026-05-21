import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
export const revalidate = 120;
export default async function AdminTopLists() {
  const { data: items } = await createServerClient().from("top_lists").select("*").order("created_at", { ascending: false });
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">🏆 Top Lists</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Title</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Views</th><th className="px-4 py-3">Active</th><th className="px-4 py-3">Actions</th></tr></thead>
          <tbody>
            {(items || []).map((i: any) => (
              <tr key={i.id} className="border-b border-brand-border/50">
                <td className="px-4 py-3 text-gray-200">{i.title_bn}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{i.slug}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{i.view_count}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${i.is_active ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"}`}>{i.is_active ? "Yes" : "No"}</span></td>
                <td className="px-4 py-3"><Link href={`/top-lists/${i.slug}`} target="_blank" className="text-xs text-brand-electric hover:underline">View</Link></td>
              </tr>
            ))}
          </tbody>
        </table>
        {(!items || items.length === 0) && <p className="text-center text-gray-600 py-10">কোনো top list নেই</p>}
      </div>
    </div>
  );
}
