import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
export const revalidate = 3600;
export default async function DealDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: deal } = await sb.from("deals").select("*, tools(name, slug, logo_url)").eq("slug", params.slug).eq("is_active", true).single();
  if (!deal) notFound();
  try {
    await sb.rpc("increment_view", { tbl: "deals", slug_val: params.slug });
  } catch {
    // View counts should not block page rendering.
  }
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8"><Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span><Link href="/deals" className="hover:text-gray-300">ডিলস</Link></nav>
      <div className="glass-card p-8 text-center">
        <span className="text-5xl block mb-4">🏷️</span>
        <h1 className="text-2xl font-extrabold text-white mb-2">{deal.title_bn}</h1>
        {deal.tools && <p className="text-gray-400 mb-4">🛠️ {deal.tools.name}</p>}
        <p className="text-gray-300 mb-6">{deal.description_bn}</p>
        <div className="flex items-center justify-center gap-3 mb-6">
          {deal.original_price && <span className="text-lg text-gray-600 line-through">{deal.original_price}</span>}
          {deal.deal_price && <span className="text-3xl font-bold text-brand-green">{deal.deal_price}</span>}
          {deal.discount_text && <span className="px-3 py-1 rounded-full bg-red-500/20 text-red-400 font-bold">{deal.discount_text}</span>}
        </div>
        {deal.coupon_code && <div className="bg-white/5 border-2 border-dashed border-brand-border rounded-xl px-6 py-4 mb-6 inline-block"><span className="text-sm text-gray-400">কুপন কোড: </span><span className="font-mono text-2xl text-brand-electric font-bold">{deal.coupon_code}</span></div>}
        {deal.deal_url && <a href={deal.deal_url} target="_blank" rel="noopener noreferrer" className="btn-primary block">🔗 ডিল পেতে ক্লিক করুন</a>}
        {deal.expires_at && <p className="text-xs text-gray-600 mt-4">মেয়াদ: {new Date(deal.expires_at).toLocaleDateString("bn-BD")}</p>}
      </div>
    </div>
  );
}
