import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { mergeCuratedDeals } from "@/lib/curated-deals";

export const metadata: Metadata = { title: "AI টুলস ডিলস ও অফার" };
export const revalidate = 1800;

export default async function DealsPage() {
  const { data: dbDeals } = await createServerClient().from("deals").select("*, tools(name, logo_url, slug)").eq("is_active", true).order("created_at", { ascending: false });
  const deals = mergeCuratedDeals(dbDeals);
  const featured = deals.filter((deal: any) => deal.is_featured).slice(0, 3);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <section className="mb-8 rounded-lg border border-white/10 bg-white/[0.035] p-5 sm:p-8">
        <div className="max-w-3xl">
          <p className="mb-3 inline-flex rounded-lg border border-orange-300/20 bg-orange-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.12em] text-orange-200">
            AI Tools Deals
          </p>
          <h1 className="text-3xl font-extrabold text-white sm:text-5xl">AI টুলস ডিলস, ফ্রি প্ল্যান ও স্টার্টার অফার</h1>
          <p className="mt-4 text-base leading-8 text-gray-400">
            Paid plan নেওয়ার আগে কোন AI tool free tier, student/startup option বা self-host route দিয়ে test করা যায়, এখানে সেই curated deal posts রাখা হয়েছে।
          </p>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {featured.map((deal: any) => (
            <Link key={deal.id} href={`/deals/${deal.slug}`} className="glass-card card-hover p-5">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-lg border border-orange-300/20 bg-orange-300/10 px-2.5 py-1 text-xs font-bold text-orange-200">Featured</span>
                {deal.discount_text && <span className="rounded-lg border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-xs font-bold text-emerald-200">{deal.discount_text_bn || deal.discount_text}</span>}
              </div>
              <h2 className="line-clamp-2 text-lg font-extrabold text-white">{deal.title_bn}</h2>
              {deal.tools && <p className="mt-2 text-sm text-cyan-200">{deal.tools.name}</p>}
              <p className="mt-3 line-clamp-3 text-sm leading-7 text-gray-400">{deal.description_bn}</p>
              <div className="mt-4 flex flex-wrap items-center gap-2">
                {deal.original_price && <span className="text-xs text-gray-600 line-through">{deal.original_price}</span>}
                {deal.deal_price && <span className="text-base font-extrabold text-emerald-300">{deal.deal_price}</span>}
              </div>
            </Link>
          ))}
        </section>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.map((deal: any) => (
          <article key={deal.id} className="glass-card card-hover flex flex-col p-5">
            <div className="mb-4 flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.055] text-lg">%</div>
              <div className="min-w-0">
                <h2 className="line-clamp-2 text-base font-extrabold text-white">{deal.title_bn}</h2>
                {deal.tools && <p className="mt-1 text-xs text-gray-500">{deal.tools.name}</p>}
              </div>
            </div>
            <p className="line-clamp-3 text-sm leading-7 text-gray-400">{deal.description_bn}</p>
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {deal.original_price && <span className="text-xs text-gray-600 line-through">{deal.original_price}</span>}
              {deal.deal_price && <span className="text-sm font-bold text-emerald-300">{deal.deal_price}</span>}
              {deal.discount_text && <span className="rounded-lg border border-red-300/20 bg-red-300/10 px-2 py-0.5 text-xs font-semibold text-red-200">{deal.discount_text_bn || deal.discount_text}</span>}
            </div>
            {deal.coupon_code && (
              <div className="mt-4 rounded-lg border border-dashed border-brand-border bg-white/[0.035] px-3 py-2 text-center">
                <span className="text-xs text-gray-400">কুপন: </span>
                <span className="font-mono font-bold text-brand-electric">{deal.coupon_code}</span>
              </div>
            )}
            <div className="mt-5 flex items-center justify-between gap-3 pt-2">
              <Link href={`/deals/${deal.slug}`} className="text-sm font-semibold text-brand-electric hover:underline">বিস্তারিত দেখুন</Link>
              {deal.source_label && <span className="text-xs text-gray-600">{deal.source_label}</span>}
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
