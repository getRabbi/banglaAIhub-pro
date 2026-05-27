import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { PRICING_LABELS, BADGE_LABELS } from "@/lib/constants";
import { findCuratedTool, getCuratedTools } from "@/lib/curated-tools";
import { normalizeTool, normalizeTools } from "@/lib/schema-normalizers";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createServerClient();
  const { data: tool } = await sb.from("tools").select("name, tagline_bn, slug").eq("slug", params.slug).single();
  const curated = tool ? null : findCuratedTool(params.slug);
  if (!tool && !curated) return { title: "টুল পাওয়া যায়নি" };
  const item = tool || curated!;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  return {
    title: `${item.name} — রিভিউ ও বিস্তারিত`,
    description: item.tagline_bn || `${item.name} AI tool review in Bangla`,
    openGraph: { title: item.name, description: item.tagline_bn, url: `${base}/tools/${item.slug}`, images: [`${base}/api/og/${item.slug}`] },
  };
}

export default async function ToolDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: rawTool } = await sb.from("tools").select("*, categories(name_bn, slug, icon)").eq("slug", params.slug).eq("status", "published").single();
  const curatedTool = rawTool ? null : findCuratedTool(params.slug);
  if (!rawTool && !curatedTool) notFound();
  const tool = rawTool ? normalizeTool(rawTool) : curatedTool!;

  if (rawTool) {
    try {
      await sb.rpc("increment_view", { tbl: "tools", slug_val: params.slug });
    } catch {
      // View counts should not block page rendering.
    }
  }

  // Alternatives
  let alternatives: any[] = [];
  if (rawTool) {
    const { data: altLinks } = await sb.from("tool_alternatives").select("alternative_id").eq("tool_id", tool.id);
    if (altLinks && altLinks.length > 0) {
      const ids = altLinks.map((a: any) => a.alternative_id);
      const { data } = await sb.from("tools").select("name, slug, logo_url, pricing_type, tagline_bn, status").in("id", ids).eq("status", "published");
      alternatives = normalizeTools(data);
    }
  }
  if (alternatives.length === 0 && tool.categories?.slug) {
    alternatives = getCuratedTools({ categorySlug: tool.categories.slug }).filter((item) => item.slug !== tool.slug).slice(0, 4);
  }

  const faq = tool.faq || [];
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const categoryName = tool.categories?.name_bn || "AI টুল";
  const pricingLabel = tool.pricing && PRICING_LABELS[tool.pricing] ? PRICING_LABELS[tool.pricing].label : "ফ্রিমিয়াম/পেইড";
  const bestFor = tool.best_for_bn || [
    `${categoryName} workflow শুরু করতে চান এমন freelancer, creator বা small team`,
    "কম সময়ে draft, idea, automation বা client-ready output তৈরি করতে চান",
    "বাংলাদেশি market অনুযায়ী কম খরচে productivity বাড়াতে চান",
  ];
  const bdUseCases = tool.bd_use_cases_bn || [
    "Freelancing proposal, client communication বা delivery workflow দ্রুত করা",
    "Facebook/YouTube/content marketing-এর জন্য idea, script, visual বা summary তৈরি করা",
    "Small business operations, research, reporting বা repetitive task কমানো",
  ];
  const workflow = tool.workflow_bn || [
    "প্রথমে কাজের goal লিখুন: output কী, audience কারা, language/style কেমন হবে।",
    `${tool.name}-এ একটি ছোট sample task দিন এবং result quality যাচাই করুন।`,
    "ভালো output পেলে reusable prompt/template বানিয়ে রাখুন।",
    "Final publish/send করার আগে fact, tone, spelling ও policy check করুন।",
  ];
  const setupSteps = tool.setup_steps_bn || [
    "Free plan থাকলে আগে free account দিয়ে test করুন।",
    "একটি real কাজের ছোট অংশ দিয়ে output benchmark করুন।",
    "Team/member access, privacy setting ও billing limit দেখে নিন।",
    "যে workflow বারবার লাগে সেটার জন্য prompt বা checklist তৈরি করুন।",
  ];
  const selectionTips = tool.selection_tips_bn || [
    `আপনার main কাজ ${categoryName} হলে shortlist-এ রাখুন।`,
    "Free limit, export option, commercial usage policy এবং data privacy মিলিয়ে দেখুন।",
    "একই category-র ২-৩টি alternative test করে quality বনাম cost compare করুন।",
  ];
  const limitations = tool.limitations_bn || (tool.cons?.length > 0 ? tool.cons : [
    "AI output final truth ধরে নেওয়া যাবে না; important তথ্য verify করা দরকার।",
    "Brand voice, legal/compliance এবং sensitive data ব্যবহারে manual review দরকার।",
    "ভালো result পেতে clear prompt, sample এবং iteration দরকার হতে পারে।",
  ]);
  const quickStats = [
    { label: "Best for", value: categoryName },
    { label: "Pricing", value: pricingLabel },
    { label: "Rating", value: tool.rating > 0 ? `${tool.rating}/5` : "Review pending" },
  ];

  // JSON-LD Schema
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description_bn || tool.tagline_bn,
    url: `${base}/tools/${tool.slug}`,
    applicationCategory: "WebApplication",
    offers: { "@type": "Offer", price: tool.pricing === "free" ? "0" : "", priceCurrency: "USD" },
    aggregateRating: tool.rating > 0 ? { "@type": "AggregateRating", ratingValue: tool.rating, reviewCount: tool.review_count || 1 } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-300">হোম</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-gray-300">টুলস</Link>
          {tool.categories && <>
            <span>/</span>
            <Link href={`/categories/${tool.categories.slug}`} className="hover:text-gray-300">{tool.categories.name_bn}</Link>
          </>}
          <span>/</span>
          <span className="text-gray-400">{tool.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-10">
          {/* ─── Main Content ─── */}
          <div>
            <div className="flex items-start gap-4 mb-6">
              <div className="w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                {tool.logo_url ? <Image src={tool.logo_url} alt="" width={48} height={48} className="w-12 h-12 rounded-lg object-contain" /> : <span className="text-3xl">🤖</span>}
              </div>
              <div>
                <h1 className="text-3xl font-extrabold text-white">{tool.name}</h1>
                <p className="text-gray-400 mt-1">{tool.tagline_bn || tool.tagline}</p>
                <div className="flex items-center gap-3 mt-2">
                  {tool.pricing && PRICING_LABELS[tool.pricing] && (
                    <span className={`text-xs px-2.5 py-1 rounded-full border ${PRICING_LABELS[tool.pricing].color}`}>{PRICING_LABELS[tool.pricing].label}</span>
                  )}
                  {tool.badge && BADGE_LABELS[tool.badge] && (
                    <span className="text-xs text-amber-400">{BADGE_LABELS[tool.badge].icon} {BADGE_LABELS[tool.badge].label}</span>
                  )}
                  {tool.rating > 0 && <span className="text-xs text-yellow-400">⭐ {tool.rating}/5</span>}
                </div>
              </div>
            </div>

            <div className="glass-card p-5 mb-6">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {quickStats.map((item) => (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-4">
                    <p className="text-xs uppercase tracking-wider text-gray-500 mb-1">{item.label}</p>
                    <p className="font-semibold text-white">{item.value}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 text-sm leading-7 text-gray-400">
                {tool.name} মূলত {categoryName} কাজে ব্যবহারযোগ্য। সঠিক workflow, prompt এবং review process থাকলে এটি সময় বাঁচায়, output quality steady রাখে এবং ছোট team-কে premium-level delivery দিতে সাহায্য করে।
              </p>
            </div>

            {/* Description */}
            {tool.description_bn && (
              <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3">📖 বিস্তারিত</h2>
                <div className="text-gray-300 leading-8 whitespace-pre-line">{tool.description_bn}</div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">🎯 কাদের জন্য ভালো</h2>
                <ul className="space-y-3">
                  {bestFor.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-green/15 text-xs text-brand-green">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">🇧🇩 বাংলাদেশে ব্যবহার</h2>
                <ul className="space-y-3">
                  {bdUseCases.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="mt-1 grid h-5 w-5 shrink-0 place-items-center rounded bg-brand-cyan/15 text-xs text-brand-cyan">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Features */}
            {tool.features_bn && tool.features_bn.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-3">✨ ফিচারস</h2>
                <ul className="space-y-2">
                  {tool.features_bn.map((f: string, i: number) => (
                    <li key={i} className="flex items-start gap-2 text-gray-300">
                      <span className="text-brand-green mt-0.5">✓</span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">⚙️ Practical workflow</h2>
                <ol className="space-y-3">
                  {workflow.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-xs font-bold text-white">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">🚀 শুরু করার checklist</h2>
                <ol className="space-y-3">
                  {setupSteps.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg border border-brand-electric/20 bg-brand-electric/10 text-xs font-bold text-brand-electric">{i + 1}</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Pros / Cons */}
            {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                {tool.pros?.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-green-400 mb-3">👍 সুবিধা</h3>
                    <ul className="space-y-2">{tool.pros.map((p: string, i: number) => <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-green-400">+</span>{p}</li>)}</ul>
                  </div>
                )}
                {tool.cons?.length > 0 && (
                  <div className="glass-card p-6">
                    <h3 className="text-lg font-bold text-red-400 mb-3">👎 অসুবিধা</h3>
                    <ul className="space-y-2">{tool.cons.map((c: string, i: number) => <li key={i} className="text-gray-300 text-sm flex gap-2"><span className="text-red-400">-</span>{c}</li>)}</ul>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">💎 কেনার/ব্যবহারের আগে দেখুন</h2>
                <ul className="space-y-3">
                  {selectionTips.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="text-brand-orange">◆</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="glass-card p-6">
                <h2 className="text-xl font-bold text-white mb-4">⚠️ সীমাবদ্ধতা</h2>
                <ul className="space-y-3">
                  {limitations.map((item: string, i: number) => (
                    <li key={i} className="flex gap-3 text-sm leading-7 text-gray-300">
                      <span className="text-red-400">!</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* FAQ */}
            {faq.length > 0 && (
              <div className="glass-card p-6 mb-6">
                <h2 className="text-xl font-bold text-white mb-4">❓ FAQ</h2>
                <div className="space-y-4">
                  {faq.map((item: any, i: number) => (
                    <details key={i} className="group">
                      <summary className="cursor-pointer text-gray-200 font-medium hover:text-white transition-colors">{item.q}</summary>
                      <p className="mt-2 text-sm text-gray-400 pl-4 border-l-2 border-brand-border">{item.a}</p>
                    </details>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ─── Sidebar ─── */}
          <aside className="space-y-5">
            {/* CTA */}
            <div className="glass-card glow-orange p-6 text-center sticky top-20">
              <h3 className="font-bold text-white text-lg mb-2">{tool.name} ব্যবহার করুন</h3>
              {tool.pricing_detail && <p className="text-sm text-gray-400 mb-4">{tool.pricing_detail}</p>}
              {tool.affiliate_slug ? (
                <Link href={`/go/${tool.affiliate_slug}`} target="_blank" className="btn-primary w-full block text-center">
                  🔗 {tool.name} এ যান
                </Link>
              ) : tool.website_url ? (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full block text-center">
                  🌐 ওয়েবসাইট দেখুন
                </a>
              ) : null}
              <p className="text-xs text-gray-600 mt-3">👁 {tool.view_count} বার দেখা হয়েছে</p>
            </div>

            {/* Alternatives */}
            {alternatives.length > 0 && (
              <div className="glass-card p-5">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">🔄 বিকল্প টুলস</h3>
                <div className="space-y-3">
                  {alternatives.map((alt: any) => (
                    <Link key={alt.slug} href={`/tools/${alt.slug}`} className="flex items-center gap-3 group">
                      <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                        {alt.logo_url ? <Image src={alt.logo_url} alt="" width={24} height={24} className="w-6 h-6 rounded object-contain" /> : <span>🤖</span>}
                      </div>
                      <div>
                        <p className="text-sm text-gray-300 group-hover:text-white transition-colors font-medium">{alt.name}</p>
                        <p className="text-xs text-gray-600">{alt.tagline_bn}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Share */}
            <div className="glass-card p-5">
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">📤 শেয়ার করুন</h3>
              <div className="flex gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${base}/tools/${tool.slug}`} target="_blank" className="btn-secondary text-xs flex-1 text-center">Facebook</a>
                <a href={`https://api.whatsapp.com/send?text=${tool.name} ${base}/tools/${tool.slug}`} target="_blank" className="btn-secondary text-xs flex-1 text-center">WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
