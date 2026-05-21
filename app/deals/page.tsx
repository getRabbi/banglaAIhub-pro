import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = { title: "ডিলস ও অফার" };
export const revalidate = 1800;
export default async function DealsPage() {
  const { data: deals } = await createServerClient().from("deals").select("*, tools(name, logo_url, slug)").eq("is_active", true).order("created_at", { ascending: false });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">🔥 AI টুলস ডিলস</h1>
      <p className="text-gray-400 mb-8">সেরা AI টুলসে বিশেষ ছাড় ও অফার</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {(deals || []).map((d: any) => (
          <div key={d.id} className="glass-card card-hover p-5">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-2xl">🏷️</span>
              <div><h2 className="font-semibold text-white text-sm">{d.title_bn}</h2>{d.tools && <p className="text-xs text-gray-500">{d.tools.name}</p>}</div>
            </div>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{d.description_bn}</p>
            <div className="flex items-center gap-2 mb-3">
              {d.original_price && <span className="text-xs text-gray-600 line-through">{d.original_price}</span>}
              {d.deal_price && <span className="text-sm font-bold text-brand-green">{d.deal_price}</span>}
              {d.discount_text && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{d.discount_text}</span>}
            </div>
            {d.coupon_code && <div className="bg-white/5 border border-dashed border-brand-border rounded-lg px-3 py-2 text-center mb-3"><span className="text-xs text-gray-400">কুপন: </span><span className="font-mono text-brand-electric font-bold">{d.coupon_code}</span></div>}
            <Link href={`/deals/${d.slug}`} className="text-xs text-brand-electric hover:underline">বিস্তারিত →</Link>
          </div>
        ))}
      </div>
      {(!deals || deals.length === 0) && <p className="text-center text-gray-500 py-20">ডিলস শীঘ্রই আসছে!</p>}
    </div>
  );
}
