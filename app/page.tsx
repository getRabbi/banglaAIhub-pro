import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { unstable_noStore as noStore } from "next/cache";
import { PRICING_LABELS, BADGE_LABELS, formatBanglaDateShort } from "@/lib/constants";
import { getCuratedTools, mergeCuratedTools } from "@/lib/curated-tools";
import { mergeCuratedDeals } from "@/lib/curated-deals";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";
import { normalizeTools } from "@/lib/schema-normalizers";

export const revalidate = 1800;
export const dynamic = "force-dynamic";

const BLOG_CAT_BADGE: Record<string, { emoji: string; label: string; cls: string }> = {
  "money-making": { emoji: "💰", label: "অনলাইন আয়", cls: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  "ai-tools": { emoji: "🤖", label: "AI টুলস", cls: "bg-violet-500/10 text-violet-400 border-violet-500/20" },
  "tech-news": { emoji: "📡", label: "টেক নিউজ", cls: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  "product-review": { emoji: "🚀", label: "প্রোডাক্ট রিভিউ", cls: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
};

const PROMPT_FALLBACKS = [
  { title: "কনটেন্ট আইডিয়া জেনারেটর", description: "নিশ, অডিয়েন্স ও লক্ষ্য দিলে ৩০ দিনের পোস্ট আইডিয়া, হুক এবং CTA বানানোর প্রম্পট।", href: "/prompts", meta: "Content · ChatGPT" },
  { title: "ক্লায়েন্ট প্রপোজাল প্রম্পট", description: "ফ্রিল্যান্স কাজের জন্য প্রফেশনাল প্রপোজাল, স্কোপ, টাইমলাইন ও প্রাইসিং লিখুন।", href: "/prompts", meta: "Freelance · সব AI" },
  { title: "SEO ব্লগ আউটলাইন প্রম্পট", description: "কিওয়ার্ড থেকে হেডিং, FAQ, সার্চ ইনটেন্ট ও বাংলা ব্লগ স্ট্রাকচার তৈরি করুন।", href: "/prompts", meta: "SEO · বাংলা" },
];

const GUIDE_FALLBACKS = [
  { title: "AI টুল বাছাই করার চেকলিস্ট", description: "দাম, ডেটা প্রাইভেসি, আউটপুট কোয়ালিটি ও ব্যবহার সহজ কিনা দ্রুত যাচাই করুন।", href: "/guides", meta: "৮ মিনিট" },
  { title: "বাংলা কনটেন্ট ওয়ার্কফ্লো", description: "রিসার্চ, ড্রাফট, এডিট, ইমেজ ও পাবলিশিং পর্যন্ত একটি practical AI workflow।", href: "/guides", meta: "১০ মিনিট" },
  { title: "Automation শুরু করার গাইড", description: "নো-কোড টুল দিয়ে lead capture, report, email এবং social posting automate করুন।", href: "/guides", meta: "১২ মিনিট" },
];

const EARN_FALLBACKS = [
  { title: "AI দিয়ে সার্ভিস প্যাকেজ বানান", description: "রাইটিং, ডিজাইন, automation বা research service কীভাবে offer করবেন তার কাঠামো।", href: "/make-money", meta: "প্রথম আয়" },
  { title: "ফ্রিল্যান্সারদের জন্য AI workflow", description: "কাজ দ্রুত শেষ করা, quality ধরে রাখা এবং client delivery polish করার practical guide।", href: "/make-money", meta: "Freelance" },
  { title: "কনটেন্ট থেকে ইনকাম", description: "ব্লগ, Facebook, YouTube Shorts ও newsletter দিয়ে audience build করার roadmap।", href: "/make-money", meta: "Content" },
];

export default async function HomePage() {
  noStore();
  const sb = createServerClient();

  const [{ data: rawFeaturedTools }, rawRecentBlog, { data: categories }, { data: deals }, { data: rawPrompts }, { data: rawGuides }] = await Promise.all([
    sb.from("tools").select("*, categories(name_bn, slug)").eq("status", "published").order("view_count", { ascending: false }).limit(8),
    fetchPublishedBlogPosts(sb, { orderBy: "published_at", limit: 20 }),
    sb.from("categories").select("*").order("sort_order").limit(12),
    sb.from("deals").select("*, tools(name, logo_url)").eq("is_active", true).order("created_at", { ascending: false }).limit(4),
    sb.from("prompts").select("id, slug, title_bn, description_bn, tool_name, category, view_count").eq("is_active", true).order("view_count", { ascending: false }).limit(3),
    sb.from("guides").select("id, slug, title_bn, description_bn, read_time_min, published_at").eq("is_active", true).order("published_at", { ascending: false }).limit(3),
  ]);
  const featuredTools = mergeCuratedTools(normalizeTools(rawFeaturedTools), getCuratedTools()).slice(0, 8);
  const recentBlog = rawRecentBlog.slice(0, 6);
  const activeDeals = mergeCuratedDeals(deals).slice(0, 4);
  const promptCards = (rawPrompts && rawPrompts.length > 0)
    ? rawPrompts.map((item: any) => ({ title: item.title_bn, description: item.description_bn, href: `/prompts/${item.slug}`, meta: `${item.tool_name || "সব AI"} · ${item.category || "Prompt"}` }))
    : PROMPT_FALLBACKS;
  const guideCards = (rawGuides && rawGuides.length > 0)
    ? rawGuides.map((item: any) => ({ title: item.title_bn, description: item.description_bn, href: `/guides/${item.slug}`, meta: `${item.read_time_min || 5} মিনিট` }))
    : GUIDE_FALLBACKS;
  const earnCards = rawRecentBlog.filter((post: any) => post.category === "money-making").slice(0, 3).map((post: any) => ({
    title: post.bangla_title,
    description: post.bangla_hook,
    href: `/blog/${post.blog_slug}`,
    meta: `${post.read_time_min} মিনিট`,
  }));
  const moneyCards = earnCards.length > 0 ? earnCards : EARN_FALLBACKS;

  return (
    <div className="min-h-screen">
      {/* ═══ HERO ═══ */}
      <section className="relative overflow-hidden border-b border-brand-border bg-gradient-to-b from-white/[0.045] to-transparent">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16 pb-14 sm:pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-blue/10 border border-brand-blue/20 text-brand-electric text-sm font-semibold mb-5 sm:mb-6">
            <span>🤖</span>
            <span>বাংলায় সেরা AI টুলস প্ল্যাটফর্ম</span>
          </div>
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold mb-5 sm:mb-6">
            <span className="text-white">AI টুলস খুঁজুন,</span><br />
            <span className="gradient-text">অনলাইনে আয় করুন</span>
          </h1>
          <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-8">৫০০+ AI টুলস রিভিউ, অনলাইন আয়ের প্র্যাক্টিক্যাল গাইড, এবং সেরা ডিলস — সব বাংলায়</p>
          <form action="/search" method="GET" className="max-w-xl mx-auto relative mb-6 sm:mb-8">
            <input name="q" type="text" placeholder="কোন AI টুল খুঁজছেন? যেমন: ChatGPT, ইমেজ জেনারেটর..." className="w-full px-4 sm:px-5 py-4 rounded-lg bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-electric/50 focus:ring-2 focus:ring-brand-electric/20 pr-14 shadow-lg shadow-black/10" />
            <button type="submit" className="absolute right-2.5 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-lg bg-brand-blue hover:bg-blue-500 text-white transition-colors" aria-label="Search">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
            </button>
          </form>
          <div className="flex flex-wrap justify-center gap-2">
            {["ChatGPT", "ইমেজ তৈরি", "কোডিং", "রাইটিং", "ভিডিও", "ফ্রিল্যান্সিং"].map((tag) => (
              <Link key={tag} href={`/search?q=${encodeURIComponent(tag)}`} className="px-3 py-1.5 text-xs rounded-full bg-white/5 text-gray-400 hover:bg-white/10 hover:text-gray-200 border border-brand-border transition-all">{tag}</Link>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CATEGORIES ═══ */}
      {categories && categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">📂 ক্যাটাগরি</h2>
            <Link href="/categories" className="text-sm text-brand-electric hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {categories.map((cat: any) => (
              <Link key={cat.id} href={`/categories/${cat.slug}`} className="glass-card card-hover p-4 text-center group">
                <span className="text-3xl block mb-2">{cat.icon}</span>
                <p className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">{cat.name_bn}</p>
                <p className="text-xs text-gray-600 mt-1">{Math.max(cat.tool_count || 0, getCuratedTools({ categorySlug: cat.slug }).length)} টুল</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ TRENDING TOOLS ═══ */}
      {featuredTools && featuredTools.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">🔥 জনপ্রিয় টুলস</h2>
            <Link href="/tools" className="text-sm text-brand-electric hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTools.map((tool: any) => (
              <Link key={tool.id} href={`/tools/${tool.slug}`} className="glass-card card-hover p-5 group">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-xl shrink-0">
                    {tool.logo_url ? <Image src={tool.logo_url} alt="" width={32} height={32} className="w-8 h-8 rounded" /> : "🤖"}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors truncate">{tool.name}</h3>
                    <p className="text-xs text-gray-500 truncate">{tool.tagline_bn || tool.tagline}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  {tool.pricing && PRICING_LABELS[tool.pricing] && (
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${PRICING_LABELS[tool.pricing].color}`}>{PRICING_LABELS[tool.pricing].label}</span>
                  )}
                  {tool.badge && BADGE_LABELS[tool.badge] && (
                    <span className="text-xs text-amber-400">{BADGE_LABELS[tool.badge].icon} {BADGE_LABELS[tool.badge].label}</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ PROMPTS ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="section-title">💡 প্রম্পট লাইব্রেরি</h2>
            <p className="text-sm text-gray-500 mt-2">কাজ অনুযায়ী রেডিমেড prompt, copy করে AI tool-এ ব্যবহার করুন।</p>
          </div>
          <Link href="/prompts" className="text-sm text-brand-electric hover:underline">সব প্রম্পট দেখুন →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {promptCards.map((item: any) => (
            <Link key={`${item.href}-${item.title}`} href={item.href} className="glass-card card-hover p-5 group min-h-[190px] flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full border border-violet-500/20 bg-violet-500/10 text-violet-300">Prompt</span>
                <span className="text-xs text-gray-600 truncate">{item.meta}</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-violet-300 transition-colors mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
              <span className="mt-auto text-sm text-brand-electric">ব্যবহার করুন →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ GUIDES ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="section-title">📚 স্টেপ-বাই-স্টেপ গাইড</h2>
            <p className="text-sm text-gray-500 mt-2">AI tools setup, workflow, comparison এবং practical ব্যবহার এক জায়গায়।</p>
          </div>
          <Link href="/guides" className="text-sm text-brand-electric hover:underline">সব গাইড দেখুন →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {guideCards.map((item: any) => (
            <Link key={`${item.href}-${item.title}`} href={item.href} className="glass-card card-hover p-5 group min-h-[190px] flex flex-col">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full border border-cyan-500/20 bg-cyan-500/10 text-cyan-300">Guide</span>
                <span className="text-xs text-gray-600">⏱ {item.meta}</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-cyan-300 transition-colors mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
              <span className="mt-auto text-sm text-brand-electric">পড়ুন →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ MAKE MONEY RESOURCES ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-8">
          <div>
            <h2 className="section-title">💰 AI দিয়ে আয় করুন</h2>
            <p className="text-sm text-gray-500 mt-2">Freelancing, content, automation service এবং ছোট business workflow থেকে আয়ের roadmap।</p>
          </div>
          <Link href="/make-money" className="text-sm text-brand-electric hover:underline">আয়ের গাইড দেখুন →</Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {moneyCards.map((item: any) => (
            <Link key={`${item.href}-${item.title}`} href={item.href} className="glass-card card-hover p-5 group min-h-[190px] flex flex-col glow-orange">
              <div className="flex items-center justify-between gap-3 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Income</span>
                <span className="text-xs text-gray-600">{item.meta}</span>
              </div>
              <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors mb-2 leading-snug">{item.title}</h3>
              <p className="text-sm text-gray-500 line-clamp-3 mb-4">{item.description}</p>
              <span className="mt-auto text-sm text-brand-electric">শুরু করুন →</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══ LATEST BLOG ═══ */}
      {recentBlog && recentBlog.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">📝 সর্বশেষ আর্টিকেল</h2>
            <Link href="/blog" className="text-sm text-brand-electric hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {recentBlog.map((post: any) => {
              const bc = BLOG_CAT_BADGE[post.category] || BLOG_CAT_BADGE["tech-news"];
              return (
                <Link key={post.id} href={`/blog/${post.blog_slug}`} className="glass-card card-hover overflow-hidden group">
                  {post.thumbnail_url && (
                    <div className="relative h-40 bg-brand-dark overflow-hidden">
                      <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.bangla_title} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${bc.cls}`}>{bc.emoji} {bc.label}</span>
                      <span className="text-xs text-gray-600">{formatBanglaDateShort(post.published_at)}</span>
                    </div>
                    <h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors line-clamp-2 mb-2">{post.bangla_title}</h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{post.bangla_hook}</p>
                    <div className="flex items-center gap-3 mt-3 text-xs text-gray-600">
                      <span>⏱ {post.read_time_min} মিনিট</span>
                      <span>👁 {post.view_count}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ═══ DEALS ═══ */}
      {activeDeals.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
          <div className="flex items-center justify-between mb-8">
            <h2 className="section-title">🔥 সেরা ডিলস</h2>
            <Link href="/deals" className="text-sm text-brand-electric hover:underline">সব দেখুন →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {activeDeals.map((deal: any) => (
              <div key={deal.id} className="glass-card card-hover p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏷️</span>
                  <h3 className="font-semibold text-white text-sm">{deal.title_bn}</h3>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mb-3">{deal.description_bn}</p>
                <div className="flex items-center gap-2 mb-3">
                  {deal.original_price && <span className="text-xs text-gray-600 line-through">{deal.original_price}</span>}
                  {deal.deal_price && <span className="text-sm font-bold text-brand-green">{deal.deal_price}</span>}
                  {deal.discount_text && <span className="text-xs px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{deal.discount_text}</span>}
                </div>
                <Link href={`/deals/${deal.slug}`} className="text-xs text-brand-electric hover:underline">বিস্তারিত →</Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ═══ NEWSLETTER ═══ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
        <div className="glass-card glow-blue p-8 sm:p-12 text-center relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-cyan via-brand-blue to-brand-green" />
          <div className="relative z-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">📬 সাপ্তাহিক AI আপডেট</h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto leading-8">প্রতি সপ্তাহে সেরা AI টুলস, ডিলস এবং আয়ের টিপস আপনার ইনবক্সে।</p>
            <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input type="email" placeholder="আপনার ইমেইল" className="flex-1 px-4 py-3 rounded-lg bg-brand-navy border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-electric/50" required />
              <button type="submit" className="btn-primary whitespace-nowrap">সাবস্ক্রাইব</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
