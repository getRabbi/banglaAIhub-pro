"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { SOURCE_MAP, extractMarkdownHeadings, formatBanglaDate, formatBanglaDateShort, formatMarkdown } from "@/lib/constants";
const CATEGORY_MAP: Record<string, { label: string; emoji: string; color: string; textClass: string; badgeClass: string }> = {
  "money-making": { label: "অনলাইন আয়", emoji: "💰", color: "emerald", textClass: "text-emerald-400", badgeClass: "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" },
  "ai-tools": { label: "AI টুলস", emoji: "🤖", color: "violet", textClass: "text-violet-400", badgeClass: "bg-violet-500/10 border-violet-500/20 text-violet-400" },
  "tech-news": { label: "টেক নিউজ", emoji: "📡", color: "blue", textClass: "text-blue-400", badgeClass: "bg-blue-500/10 border-blue-500/20 text-blue-400" },
  "product-review": { label: "প্রোডাক্ট রিভিউ", emoji: "🚀", color: "amber", textClass: "text-amber-400", badgeClass: "bg-amber-500/10 border-amber-500/20 text-amber-400" },
};

interface Post { id: number; bangla_title: string; bangla_body: string; bangla_hook: string; blog_slug: string; blog_url: string; meta_description: string; category: string; tags: string[]; source: string; read_time_min: number; view_count: number; published_at: string; thumbnail_url?: string; thumbnail_alt?: string; }
type PostSummary = Pick<Post, "id" | "bangla_title" | "bangla_hook" | "blog_slug" | "category" | "read_time_min" | "view_count" | "published_at" | "thumbnail_url" | "thumbnail_alt">;

export default function BlogPostClient({ post, relatedPosts, trendingPosts }: { post: Post; relatedPosts: PostSummary[]; trendingPosts: PostSummary[] }) {
  const [progress, setProgress] = useState(0);
  const [showBar, setShowBar] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const tracked = useRef(false);

  useEffect(() => { if (tracked.current) return; tracked.current = true; fetch(`/api/views/${post.blog_slug}`, { method: "POST" }).catch(() => {}); }, [post.blog_slug]);

  useEffect(() => {
    const h = () => { if (!articleRef.current) return; const r = articleRef.current.getBoundingClientRect(); const t = articleRef.current.scrollHeight - window.innerHeight; const s = Math.max(0, -r.top); setProgress(Math.min(100, (s / t) * 100)); setShowBar(window.scrollY > 300); };
    window.addEventListener("scroll", h, { passive: true }); return () => window.removeEventListener("scroll", h);
  }, []);

  const cat = CATEGORY_MAP[post.category as keyof typeof CATEGORY_MAP] || CATEGORY_MAP["tech-news"];
  const base = typeof window !== "undefined" ? window.location.origin : "";
  const postUrl = `${base}/blog/${post.blog_slug}`;
  const headings = extractMarkdownHeadings(post.bangla_body).filter((heading) => heading.level === 2).slice(0, 8);

  return (
    <div className="min-h-screen">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-brand-navy/50"><div className="h-full bg-gradient-to-r from-brand-violet via-brand-blue to-brand-green transition-all duration-150" style={{ width: `${progress}%` }} /></div>

      {/* Floating title */}
      {showBar && (
        <div className="fixed top-1 left-0 right-0 z-40 px-4 py-2 bg-brand-navy/90 backdrop-blur-lg border-b border-brand-border">
          <div className="max-w-4xl mx-auto flex items-center justify-between"><p className="text-sm text-gray-400 truncate max-w-[70%]">{post.bangla_title}</p><span className="text-xs text-gray-600">{Math.round(progress)}%</span></div>
        </div>
      )}

      <article ref={articleRef} className="max-w-4xl mx-auto px-4 sm:px-6 pt-12 pb-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span>
          <Link href="/blog" className="hover:text-gray-300">ব্লগ</Link><span>/</span>
          <Link href={`/blog?category=${post.category}`} className={cat.textClass}>{cat.label}</Link>
        </nav>

        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm mb-6 ${cat.badgeClass}`}>{cat.emoji} {cat.label}</div>

        <h1 className="text-2xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white mb-6">{post.bangla_title}</h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400 mb-10 pb-8 border-b border-brand-border">
          <time dateTime={post.published_at}>📅 {formatBanglaDate(post.published_at)}</time>
          <span>⏱ {post.read_time_min} মিনিট</span>
          <span>👁 {post.view_count} বার পড়া</span>
          <span className="px-2 py-0.5 rounded bg-white/5 text-gray-500 text-xs">{SOURCE_MAP[post.source] || post.source}</span>
        </div>

        {post.thumbnail_url && (
          <figure className="mb-8 overflow-hidden rounded-lg border border-brand-border bg-brand-dark">
            <div className="relative aspect-[16/9] w-full">
              <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.bangla_title} fill sizes="(max-width: 768px) 100vw, 896px" className="object-cover" priority />
            </div>
          </figure>
        )}

        {post.bangla_hook && (
          <div className="mb-8 rounded-lg border border-brand-blue/25 bg-brand-blue/10 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-brand-electric mb-2">দ্রুত সারাংশ</p>
            <p className="text-gray-200 leading-8">{post.bangla_hook}</p>
          </div>
        )}

        {headings.length >= 3 && (
          <nav className="mb-10 rounded-lg border border-brand-border bg-white/[0.03] p-5" aria-label="Article sections">
            <p className="text-sm font-semibold text-white mb-3">এই লেখায় যা আছে</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {headings.map((heading) => (
                <a key={heading.id} href={`#${heading.id}`} className="text-sm text-gray-400 hover:text-brand-electric transition-colors">
                  {heading.text}
                </a>
              ))}
            </div>
          </nav>
        )}

        <div className="article-prose max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(post.bangla_body) }} />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-brand-border">
            {post.tags.map((tag) => <Link key={tag} href={`/blog?tag=${tag}`} className="px-3 py-1.5 text-xs rounded-full bg-white/5 text-gray-400 hover:bg-white/10 border border-brand-border transition-all">#{tag}</Link>)}
          </div>
        )}

        {/* Share */}
        <div className="glass-card p-6 mt-8">
          <p className="font-semibold text-white mb-3">📢 শেয়ার করুন</p>
          <div className="flex flex-wrap gap-3">
            <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`} target="_blank" className="btn-secondary text-sm">Facebook</a>
            <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(post.bangla_title + " " + postUrl)}`} target="_blank" className="btn-secondary text-sm">WhatsApp</a>
            <a href={`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(post.bangla_title)}`} target="_blank" className="btn-secondary text-sm">Telegram</a>
            <button onClick={() => { navigator.clipboard.writeText(postUrl); }} className="btn-secondary text-sm">📋 কপি</button>
          </div>
        </div>
      </article>

      {/* Related */}
      {relatedPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
          <h2 className="text-2xl font-bold text-white mb-8">{cat.emoji} আরো {cat.label} আর্টিকেল</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedPosts.map((rp) => <PostCard key={rp.id} post={rp} />)}
          </div>
        </section>
      )}

      {/* Trending */}
      {trendingPosts.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 border-t border-brand-border">
          <h2 className="text-2xl font-bold text-white mb-8">🔥 সবচেয়ে জনপ্রিয়</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trendingPosts.map((tp) => <PostCard key={tp.id} post={tp} />)}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-card glow-blue p-8 sm:p-12 text-center">
          <h3 className="text-2xl font-bold text-white mb-3">📬 প্রতিদিন নতুন আর্টিকেল পেতে চান?</h3>
          <p className="text-gray-400 mb-6">আমাদের Facebook পেজ ফলো করুন!</p>
          <a href="https://facebook.com/BanglaAIHub" target="_blank" className="btn-primary inline-block">📘 ফলো করুন</a>
        </div>
      </section>
    </div>
  );
}

function PostCard({ post }: { post: PostSummary }) {
  const cat = CATEGORY_MAP[post.category as keyof typeof CATEGORY_MAP] || CATEGORY_MAP["tech-news"];
  return (
    <Link href={`/blog/${post.blog_slug}`} className="glass-card card-hover overflow-hidden group block">
      {post.thumbnail_url && (
        <div className="relative h-40 bg-brand-dark overflow-hidden">
          <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.bangla_title} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
        </div>
      )}
      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-brand-border">{cat.emoji} {cat.label}</span>
          <span className="text-xs text-gray-600">{formatBanglaDateShort(post.published_at)}</span>
        </div>
        <h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors line-clamp-2 mb-2">{post.bangla_title}</h3>
        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{post.bangla_hook}</p>
        <div className="flex items-center justify-between text-xs text-gray-600"><span>⏱ {post.read_time_min} min</span><span>👁 {post.view_count}</span></div>
      </div>
    </Link>
  );
}
