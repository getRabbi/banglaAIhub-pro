import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { PRICING_LABELS } from "@/lib/constants";
import { getCuratedTools, mergeCuratedTools } from "@/lib/curated-tools";
import { normalizeBlogPosts, normalizeTools } from "@/lib/schema-normalizers";
export const metadata: Metadata = { title: "সার্চ" };
export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.trim() || "";
  let tools: any[] = [], posts: any[] = [];
  if (q) {
    const sb = createServerClient();
    const [{ data: t }, { data: p }] = await Promise.all([
      sb.from("tools").select("id,name,slug,tagline_bn,pricing_type,logo_url,status").eq("status", "published").or(`name.ilike.%${q}%,tagline_bn.ilike.%${q}%,description_bn.ilike.%${q}%`).limit(12),
      sb.from("blog_posts").select("id,title,slug,excerpt_bn,content_bn,source_platform,tags,category_id,reading_time_minutes,view_count,published_at,created_at,categories(slug)").eq("status","published").or(`title.ilike.%${q}%,excerpt_bn.ilike.%${q}%,content_bn.ilike.%${q}%`).limit(12),
    ]);
    tools = mergeCuratedTools(normalizeTools(t), getCuratedTools({ query: q })).slice(0, 12);
    posts = normalizeBlogPosts(p);
  }
  const total = tools.length + posts.length;
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">🔍 সার্চ</h1>
      <form action="/search" method="GET" className="relative mb-8">
        <input name="q" type="text" defaultValue={q} autoFocus placeholder="AI টুল বা টপিক খুঁজুন..." className="w-full px-5 py-4 rounded-2xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50 pr-14" />
        <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-xl bg-brand-blue text-white">🔍</button>
      </form>
      {q && <p className="text-gray-400 mb-6">&quot;{q}&quot; — {total}টি ফলাফল</p>}
      {tools.length > 0 && (<div className="mb-10"><h2 className="text-xl font-bold text-white mb-4">🛠️ টুলস</h2><div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{tools.map((t:any)=>(<Link key={t.id} href={`/tools/${t.slug}`} className="glass-card card-hover p-4 flex items-center gap-3 group"><div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">{t.logo_url?<img src={t.logo_url} alt="" className="w-8 h-8 rounded"/>:<span>🤖</span>}</div><div className="min-w-0"><h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors">{t.name}</h3><p className="text-xs text-gray-500 truncate">{t.tagline_bn}</p></div></Link>))}</div></div>)}
      {posts.length > 0 && (<div><h2 className="text-xl font-bold text-white mb-4">📝 আর্টিকেল</h2><div className="space-y-3">{posts.map((p:any)=>(<Link key={p.id} href={`/blog/${p.blog_slug}`} className="glass-card card-hover p-4 block group"><h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors">{p.bangla_title}</h3><p className="text-sm text-gray-500 line-clamp-1">{p.bangla_hook}</p></Link>))}</div></div>)}
      {q && total===0 && <div className="text-center py-20"><p className="text-4xl mb-4">😔</p><p className="text-gray-400">&quot;{q}&quot; পাওয়া যায়নি</p></div>}
    </div>
  );
}
