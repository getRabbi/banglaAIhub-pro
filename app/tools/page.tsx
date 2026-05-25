import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { PRICING_LABELS, BADGE_LABELS } from "@/lib/constants";
import { normalizeTools } from "@/lib/schema-normalizers";

export const metadata: Metadata = { title: "AI টুলস ডিরেক্টরি" };
export const revalidate = 1800;

export default async function ToolsPage({ searchParams }: { searchParams: { pricing?: string } }) {
  const sb = createServerClient();
  let query = sb.from("tools").select("*, categories(name_bn, slug)").eq("status", "published").order("view_count", { ascending: false });
  if (searchParams.pricing) query = query.eq("pricing_type", searchParams.pricing);
  const { data: rawTools } = await query.limit(50);
  const { data: categories } = await sb.from("categories").select("*").order("sort_order");
  const tools = normalizeTools(rawTools);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">🛠️ AI টুলস ডিরেক্টরি</h1>
      <p className="text-gray-400 mb-8">সেরা AI টুলস খুঁজুন, তুলনা করুন এবং ব্যবহার শুরু করুন</p>
      <div className="flex flex-wrap gap-2 mb-6">
        <Link href="/tools" className={`px-3 py-1.5 text-sm rounded-full border transition-all ${!searchParams.pricing ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-brand-border hover:bg-white/5"}`}>সব</Link>
        {Object.entries(PRICING_LABELS).map(([key, val]) => (
          <Link key={key} href={`/tools?pricing=${key}`} className={`px-3 py-1.5 text-sm rounded-full border transition-all ${searchParams.pricing === key ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-brand-border hover:bg-white/5"}`}>{val.label}</Link>
        ))}
      </div>
      {categories && categories.length > 0 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2">
          {categories.map((cat: any) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`} className="px-4 py-2 text-sm rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-brand-border whitespace-nowrap transition-all">{cat.icon} {cat.name_bn}</Link>
          ))}
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(tools || []).map((tool: any) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`} className="glass-card card-hover p-5 group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                {tool.logo_url ? <img src={tool.logo_url} alt="" className="w-9 h-9 rounded-lg" /> : <span className="text-2xl">🤖</span>}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors">{tool.name}</h3>
                <p className="text-xs text-gray-500 truncate">{tool.tagline_bn || tool.tagline}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-2">
              {tool.pricing && PRICING_LABELS[tool.pricing] && <span className={`text-xs px-2 py-0.5 rounded-full border ${PRICING_LABELS[tool.pricing].color}`}>{PRICING_LABELS[tool.pricing].label}</span>}
              {tool.badge && BADGE_LABELS[tool.badge] && <span className="text-xs text-amber-400">{BADGE_LABELS[tool.badge].icon}</span>}
            </div>
          </Link>
        ))}
      </div>
      {(!tools || tools.length === 0) && <div className="text-center py-20 text-gray-500"><p className="text-4xl mb-4">🔍</p><p>কোনো টুল পাওয়া যায়নি</p></div>}
    </div>
  );
}
