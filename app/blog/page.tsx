import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { BLOG_CATEGORIES, formatBanglaDateShort } from "@/lib/constants";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";

export const metadata: Metadata = { title: "ব্লগ" };
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2">📝 ব্লগ</h1>
      <p className="text-gray-400 mb-8">অনলাইন আয়, AI টুলস, টেক নিউজ — সব বাংলায়</p>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide mb-8 pb-2 sticky top-16 z-20 bg-brand-navy/95 backdrop-blur-lg py-3 -mx-4 px-4">
        <Link href="/blog" className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all ${!searchParams.category ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-brand-border hover:bg-white/5"}`}>📚 সব</Link>
        {Object.entries(BLOG_CATEGORIES).map(([key, cat]) => (
          <Link key={key} href={`/blog?category=${key}`} className={`px-4 py-2 text-sm rounded-full border whitespace-nowrap transition-all ${searchParams.category === key ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-brand-border hover:bg-white/5"}`}>
            {cat.emoji} {cat.label}
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-10">
        {/* Posts */}
        <div className="space-y-4">
          {(posts || []).map((post: any, i: number) => {
            const cat = BLOG_CATEGORIES[post.category as keyof typeof BLOG_CATEGORIES];
            const isFirst = i === 0 && !searchParams.category;
            return (
              <Link key={post.id} href={`/blog/${post.blog_slug}`} className={`glass-card card-hover overflow-hidden group block ${isFirst ? "md:grid md:grid-cols-[320px_1fr]" : "sm:grid sm:grid-cols-[180px_1fr]"}`}>
                {post.thumbnail_url && (
                  <div className={`relative bg-brand-dark overflow-hidden ${isFirst ? "min-h-[220px]" : "min-h-[150px]"}`}>
                    <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.bangla_title} fill sizes={isFirst ? "(max-width: 768px) 100vw, 320px" : "(max-width: 640px) 100vw, 180px"} className="object-cover group-hover:scale-105 transition-transform duration-500" />
                  </div>
                )}
                <div className="p-5 sm:p-6">
                  <div className="flex items-center gap-2 mb-3">
                    {cat && <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-brand-border">{cat.emoji} {cat.label}</span>}
                    <span className="text-xs text-gray-600">{formatBanglaDateShort(post.published_at)}</span>
                  </div>
                  <h2 className={`font-bold text-white group-hover:text-brand-electric transition-colors mb-2 line-clamp-2 ${isFirst ? "text-2xl" : "text-lg"}`}>{post.bangla_title}</h2>
                  <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.bangla_hook}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-600">
                    <span>⏱ {post.read_time_min} মিনিট</span>
                    <span>👁 {post.view_count}</span>
                    <span className="ml-auto text-brand-electric opacity-0 group-hover:opacity-100 transition-opacity">পড়ুন →</span>
                  </div>
                </div>
              </Link>
            );
          })}
          {(!posts || posts.length === 0) && <div className="text-center py-20 text-gray-500"><p className="text-4xl mb-4">📭</p><p>এখনো কোনো পোস্ট নেই</p></div>}
        </div>

        {/* Sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="glass-card p-5 sticky top-20">
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
