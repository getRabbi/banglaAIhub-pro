import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import { PRICING_LABELS, BADGE_LABELS } from "@/lib/constants";
import { getCuratedTools, mergeCuratedTools } from "@/lib/curated-tools";
import { normalizeTools } from "@/lib/schema-normalizers";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const { data } = await createServerClient().from("categories").select("name_bn").eq("slug", params.slug).single();
  return { title: data?.name_bn || "ক্যাটাগরি" };
}

export default async function CategoryDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: category } = await sb.from("categories").select("*").eq("slug", params.slug).single();
  if (!category) notFound();

  const { data: rawTools } = await sb.from("tools").select("*").eq("category_id", category.id).eq("status", "published").order("view_count", { ascending: false });
  const tools = mergeCuratedTools(normalizeTools(rawTools), getCuratedTools({ categorySlug: params.slug }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span>
        <Link href="/categories" className="hover:text-gray-300">ক্যাটাগরি</Link><span>/</span>
        <span className="text-gray-400">{category.name_bn}</span>
      </nav>
      <div className="flex items-center gap-3 mb-8">
        <span className="text-4xl">{category.icon}</span>
        <div><h1 className="text-3xl font-extrabold text-white">{category.name_bn}</h1><p className="text-gray-400">{category.description_bn}</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(tools || []).map((tool: any) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`} className="glass-card card-hover p-5 group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">{tool.logo_url ? <Image src={tool.logo_url} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain" /> : <span>🤖</span>}</div>
              <div className="min-w-0"><h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors">{tool.name}</h3><p className="text-xs text-gray-500 truncate">{tool.tagline_bn || tool.tagline}</p></div>
            </div>
            <div className="flex items-center justify-between">
              {tool.pricing && PRICING_LABELS[tool.pricing] && <span className={`text-xs px-2 py-0.5 rounded-full border ${PRICING_LABELS[tool.pricing].color}`}>{PRICING_LABELS[tool.pricing].label}</span>}
              {tool.badge && BADGE_LABELS[tool.badge] && <span className="text-xs text-amber-400">{BADGE_LABELS[tool.badge].icon}</span>}
            </div>
          </Link>
        ))}
      </div>
      {(!tools || tools.length === 0) && <p className="text-center text-gray-500 py-20">এই ক্যাটাগরিতে এখনো কোনো টুল নেই</p>}
    </div>
  );
}
