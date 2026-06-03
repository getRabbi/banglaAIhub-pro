import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { BLOG_CATEGORIES, formatBanglaDateShort } from "@/lib/constants";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";

export const metadata: Metadata = {
  title: "AI ব্লগ ও অনলাইন আয়ের গাইড",
  description: "বাংলায় AI tools, automation, freelancing, SEO content workflow এবং online income নিয়ে practical guide।",
};
export const dynamic = "force-dynamic";
export const revalidate = 1800;

export default async function BlogPage({ searchParams }: { searchParams: { category?: string; tag?: string } }) {
  noStore();
  const sb = createServerClient();
  const [rawPosts, trending] = await Promise.all([
    fetchPublishedBlogPosts(sb, { orderBy: "published_at", limit: 80 }),
    fetchPublishedBlogPosts(sb, { orderBy: "view_count", limit: 5 }),
  ]);
  const posts = rawPosts.filter((post) => {
    if (searchParams.category && post.category !== searchParams.category) return false;
    if (searchParams.tag && !post.tags.includes(searchParams.tag)) return false;
    return true;
  }).slice(0, 60);

  return (
    <div className="page-shell py-8 sm:py-12">
      <div className="mb-6 rounded-lg border border-white/10 bg-white/[0.035] p-4 sm:p-7">
        <div className="section-kicker mb-4">BanglaAIHub Blog</div>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-extrabold leading-tight text-white sm:text-5xl">AI, automation ও online income guide</h1>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-gray-400 sm:text-base">বাংলায় practical গাইড, SEO article, tool workflow এবং আয় করার বাস্তব roadmap।</p>
          </div>
          <div className="rounded-lg border border-white/10 bg-brand-navy/45 px-4 py-3 text-left sm:text-right">
            <p className="text-2xl font-black text-white">{posts.length}</p>
            <p className="text-xs font-semibold text-gray-500">published articles</p>
          </div>
        </div>
      </div>

      {/* Category tabs */}
      <div className="sticky top-[6.75rem] z-30 -mx-4 mb-8 flex gap-2 overflow-x-auto border-y border-white/10 bg-brand-navy/92 px-4 py-3 backdrop-blur-xl scrollbar-hide sm:-mx-6 sm:px-6 lg:top-16">
        <Link href="/blog" className={`chip ${!searchParams.category ? "border-brand-electric/40 bg-brand-electric/10 text-white" : ""}`}>📚 সব</Link>
        {Object.entries(BLOG_CATEGORIES).map(([key, cat]) => (
          <Link key={key} href={`/blog?category=${key}`} className={`chip ${searchParams.category === key ? "border-brand-electric/40 bg-brand-electric/10 text-white" : ""}`}>
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-10">
        {/* Posts */}
        <div className="space-y-4">
          {(posts || []).map((post: any, i: number) => {
            const cat = BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES];
            const isFirst = i === 0 && !searchParams.category;
            return (
              <Link key={post.id} href={`/blog/${post.blog_slug}`} className={`glass-card card-hover overflow-hidden group block ${isFirst ? "md:grid md:grid-cols-[340px_1fr]" : "sm:grid sm:grid-cols-[190px_1fr]"}`}>
                {post.thumbnail_url && (
                  <div className={`relative bg-brand-dark overflow-hidden ${isFirst ? "min-h-[220px]" : "min-h-[150px]"}`}>
                    <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.bangla_title} fill sizes={isFirst ? "(max-width: 768px) 100vw, 320px" : "(max-width: 640px) 100vw, 180px"} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    {cat && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-brand-border">{cat.emoji} {cat.label}</span>}
                    <span className="text-xs text-gray-600">{formatBanglaDateShort(post.published_at)}</span>
                  </div>
                  <h2 className={`font-bold text-white group-hover:text-brand-electric transition-colors mb-2 line-clamp-2 ${isFirst ? "text-2xl sm:text-3xl" : "text-lg"}`}>{post.bangla_title}</h2>
                  <p className="text-sm leading-7 text-gray-500 line-clamp-3 mb-4">{post.bangla_hook}</p>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <span>⏱ {post.read_time_min} মিনিট</span>
                    <span>👁 {post.view_count}</span>
                    <span className="sm:ml-auto text-brand-electric opacity-0 group-hover:opacity-100 transition-opacity">পড়ুন →</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {(!posts || posts.length === 0) && <div className="text-center py-20 text-gray-500"><p className="text-4xl mb-4">📭</p><p>এখনো কোনো পোস্ট নেই</p></div>}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="glass-card p-5 sticky top-24">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">🔥 ট্রেন্ডিং</h3>
            <div className="space-y-3">
              {(trending || []).map((t: any, i: number) => (
                <Link key={t.id} href={`/blog/${t.blog_slug}`} className="flex gap-3 group">
                  <span className="text-2xl font-black text-white/10 group-hover:text-white/20 w-8 shrink-0">{String(i + 1).padStart(2, "0")}</span>
                  <div className="min-w-0">
                    <p className="text-sm text-gray-300 group-hover:text-white transition-colors line-clamp-2 font-medium">{t.bangla_title}</p>
                    <p className="text-xs text-gray-600 mt-1">{t.view_count} views · {t.read_time_min} min</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
