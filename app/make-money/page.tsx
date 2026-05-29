import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { unstable_noStore as noStore } from "next/cache";
import { formatBanglaDateShort } from "@/lib/constants";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";
import { INCOME_ROADMAPS } from "@/lib/curated-resources";

export const metadata: Metadata = { title: "অনলাইনে আয় করুন" };
export const dynamic = "force-dynamic";
export const revalidate = 1800;

export default async function MakeMoneyPage() {
  noStore();
  const posts = (await fetchPublishedBlogPosts(createServerClient(), { orderBy: "published_at", limit: 50 })).filter((post) => post.category === "money-making").slice(0, 20);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="glass-card glow-orange p-6 sm:p-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-brand-orange via-brand-green to-brand-cyan" />
        <div className="relative"><h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">💰 AI দিয়ে অনলাইনে আয় করুন</h1><p className="text-gray-400 leading-8">ফ্রিল্যান্সিং, কনটেন্ট মনিটাইজেশন, ডিজিটাল সার্ভিস — practical গাইড বাংলায়</p></div>
      </div>

      <section className="mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
          <div>
            <h2 className="section-title">প্র্যাক্টিক্যাল আয়ের রোডম্যাপ</h2>
            <p className="text-sm text-gray-500 mt-2">শুধু idea নয়, কোন tool দিয়ে কীভাবে offer বানাবেন তার step-by-step plan।</p>
          </div>
          <Link href="/prompts" className="text-sm text-brand-electric hover:underline">প্রম্পট ব্যবহার করুন →</Link>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {INCOME_ROADMAPS.map((item) => (
            <article key={item.slug} id={item.slug} className="glass-card glow-orange p-5">
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="text-xs px-2.5 py-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-300">Income System</span>
                <span className="text-xs text-gray-600">{item.tools.length} tools</span>
              </div>
              <h2 className="text-lg font-bold text-white mb-2">{item.title}</h2>
              <p className="text-sm text-gray-500 leading-7 mb-4">{item.description}</p>
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-gray-300 mb-2">কাজের ধাপ</h3>
                <ol className="space-y-2">
                  {item.steps.map((step, index) => (
                    <li key={step} className="flex gap-2 text-sm text-gray-400 leading-6">
                      <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/5 text-xs text-gray-300">{index + 1}</span>
                      <span>{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
              <div className="flex flex-wrap gap-2 mb-4">
                {item.tools.map((tool) => (
                  <span key={tool} className="text-xs px-2 py-1 rounded-full bg-white/5 text-gray-400 border border-white/10">{tool}</span>
                ))}
              </div>
              <p className="text-sm text-emerald-300 border-t border-brand-border pt-4">{item.outcome}</p>
            </article>
          ))}
        </div>
      </section>

      {posts.length > 0 && (
        <div className="mb-6">
          <h2 className="section-title">সর্বশেষ আয়ের আর্টিকেল</h2>
          <p className="text-sm text-gray-500 mt-2">BanglaAIHub blog থেকে online income related লেখা।</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(posts || []).map((p: any) => (
          <Link key={p.id} href={`/blog/${p.blog_slug}`} className="glass-card card-hover overflow-hidden group">
            {p.thumbnail_url && (
              <div className="relative h-40 bg-brand-dark overflow-hidden">
                <Image src={p.thumbnail_url} alt={p.thumbnail_alt || p.bangla_title} fill sizes="(max-width: 768px) 100vw, 384px" className="object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            )}
            <div className="p-5">
            <h2 className="font-semibold text-white group-hover:text-brand-orange transition-colors mb-2 line-clamp-2">{p.bangla_title}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.bangla_hook}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600"><span>⏱ {p.read_time_min} min</span><span>👁 {p.view_count}</span><span>{formatBanglaDateShort(p.published_at)}</span></div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
