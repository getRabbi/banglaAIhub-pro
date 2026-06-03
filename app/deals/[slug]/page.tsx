import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { findCuratedDeal } from "@/lib/curated-deals";

export const revalidate = 3600;

export default async function DealDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: rawDeal } = await sb.from("deals").select("*, tools(name, slug, logo_url)").eq("slug", params.slug).eq("is_active", true).single();
  const curatedDeal = rawDeal ? null : findCuratedDeal(params.slug);
  if (!rawDeal && !curatedDeal) notFound();

  const deal: any = rawDeal || curatedDeal;

  if (rawDeal) {
    try {
      await sb.rpc("increment_view", { tbl: "deals", slug_val: params.slug });
    } catch {
      // View counts should not block page rendering.
    }
  }

  const highlights = Array.isArray(deal.highlights_bn) ? deal.highlights_bn : [];
  const bestFor = Array.isArray(deal.best_for_bn) ? deal.best_for_bn : [];

  return (
    <div className="mx-auto max-w-5xl px-3 py-8 sm:px-6 sm:py-10">
      <nav className="mb-8 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-gray-500 scrollbar-hide">
        <Link href="/" className="hover:text-gray-300">হোম</Link>
        <span>/</span>
        <Link href="/deals" className="hover:text-gray-300">ডিলস</Link>
        <span>/</span>
        <span className="text-gray-400">{deal.tools?.name || "AI deal"}</span>
      </nav>

      <section className="glass-card glow-orange overflow-hidden p-5 sm:p-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-lg border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-orange-200">
                AI Tools Deal
              </span>
              {deal.discount_text && (
                <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-xs font-bold text-emerald-200">
                  {deal.discount_text_bn || deal.discount_text}
                </span>
              )}
            </div>
            <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-5xl">{deal.title_bn}</h1>
            {deal.tools && (
              <Link href={`/tools/${deal.tools.slug}`} className="mt-4 inline-flex text-sm font-semibold text-cyan-200 hover:underline">
                {deal.tools.name} রিভিউ দেখুন
              </Link>
            )}
            <p className="mt-5 text-base leading-8 text-gray-300">{deal.description_bn}</p>
          </div>

          <aside className="rounded-lg border border-white/10 bg-black/[0.16] p-5">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-500">Deal snapshot</p>
            <div className="space-y-3">
              {deal.original_price && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <span className="text-sm text-gray-400">Regular</span>
                  <span className="text-sm text-gray-600 line-through">{deal.original_price}</span>
                </div>
              )}
              {deal.deal_price && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-300/20 bg-emerald-300/10 p-3">
                  <span className="text-sm text-emerald-100">Deal</span>
                  <span className="text-lg font-extrabold text-emerald-200">{deal.deal_price}</span>
                </div>
              )}
              {deal.coupon_code && (
                <div className="rounded-lg border border-dashed border-brand-border bg-white/[0.035] p-3 text-center">
                  <p className="text-xs text-gray-500">কুপন কোড</p>
                  <p className="font-mono text-xl font-extrabold text-brand-electric">{deal.coupon_code}</p>
                </div>
              )}
            </div>
            {deal.deal_url && (
              <a href={deal.deal_url} target="_blank" rel="noopener noreferrer" className="btn-primary mt-5 w-full text-center">
                Official deal দেখুন
              </a>
            )}
            {deal.expires_at && <p className="mt-4 text-xs text-gray-600">মেয়াদ: {new Date(deal.expires_at).toLocaleDateString("bn-BD")}</p>}
          </aside>
        </div>
      </section>

      <div className="mt-6 grid grid-cols-1 gap-5 lg:grid-cols-2">
        {highlights.length > 0 && (
          <section className="glass-card p-5 sm:p-6">
            <h2 className="mb-4 text-xl font-extrabold text-white">এই deal-এ কী পাবেন</h2>
            <div className="space-y-3">
              {highlights.map((item: string) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-7 text-gray-300">
                  <span className="text-emerald-300">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {bestFor.length > 0 && (
          <section className="glass-card p-5 sm:p-6">
            <h2 className="mb-4 text-xl font-extrabold text-white">কাদের জন্য ভালো</h2>
            <div className="space-y-3">
              {bestFor.map((item: string) => (
                <div key={item} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/[0.035] p-3 text-sm leading-7 text-gray-300">
                  <span className="text-cyan-300">•</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      {(deal.caution_bn || deal.source_url) && (
        <section className="mt-6 rounded-lg border border-amber-300/20 bg-amber-300/[0.07] p-5">
          <h2 className="mb-2 text-lg font-extrabold text-amber-100">ব্যবহারের আগে যাচাই করুন</h2>
          {deal.caution_bn && <p className="text-sm leading-7 text-gray-300">{deal.caution_bn}</p>}
          {deal.source_url && (
            <a href={deal.source_url} target="_blank" rel="noopener noreferrer" className="mt-3 inline-flex text-sm font-semibold text-amber-100 hover:underline">
              Source: {deal.source_label || "Official page"}
            </a>
          )}
        </section>
      )}
    </div>
  );
}
