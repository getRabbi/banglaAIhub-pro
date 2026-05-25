import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { formatBanglaDateShort } from "@/lib/constants";
import { normalizeBlogPosts } from "@/lib/schema-normalizers";
export const metadata: Metadata = { title: "অনলাইনে আয় করুন" };
export const dynamic = "force-dynamic";
export const revalidate = 1800;
export default async function MakeMoneyPage() {
  const { data } = await createServerClient().from("blog_posts").select("id, title, slug, excerpt_bn, source_platform, category_id, tags, reading_time_minutes, view_count, thumbnail_url, published_at, created_at, categories(slug, name_bn, icon)").eq("status", "published").order("published_at", { ascending: false }).limit(50);
  const posts = normalizeBlogPosts(data).filter((post) => post.category === "money-making").slice(0, 20);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="glass-card glow-orange p-8 mb-10 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.1),transparent_60%)]" />
        <div className="relative"><h1 className="text-3xl font-extrabold text-white mb-2">💰 AI দিয়ে অনলাইনে আয় করুন</h1><p className="text-gray-400">ফ্রিল্যান্সিং, কনটেন্ট, অ্যাফিলিয়েট — practical গাইড বাংলায়</p></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(posts || []).map((p: any) => (
          <Link key={p.id} href={`/blog/${p.blog_slug}`} className="glass-card card-hover p-5 group">
            <h2 className="font-semibold text-white group-hover:text-brand-orange transition-colors mb-2 line-clamp-2">{p.bangla_title}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{p.bangla_hook}</p>
            <div className="flex items-center gap-3 text-xs text-gray-600"><span>⏱ {p.read_time_min} min</span><span>👁 {p.view_count}</span><span>{formatBanglaDateShort(p.published_at)}</span></div>
          </Link>
        ))}
      </div>
      {(!posts || posts.length === 0) && <p className="text-center text-gray-500 py-20">আয়ের গাইড শীঘ্রই আসছে!</p>}
    </div>
  );
}
