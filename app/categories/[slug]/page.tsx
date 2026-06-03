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
  if (!data && params.slug === "ai-tools") return { title: "AI টুলস" };
  return { title: data?.name_bn || "ক্যাটাগরি" };
}

export default async function CategoryDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: category } = await sb.from("categories").select("*").eq("slug", params.slug).single();
  const fallbackCategory = params.slug === "ai-tools"
    ? { id: "ai-tools", slug: "ai-tools", name_bn: "AI টুলস", icon: "🤖", description_bn: "সব ধরনের জনপ্রিয় AI টুল একসাথে দেখুন" }
    : null;
  const activeCategory = category || fallbackCategory;
  if (!activeCategory) notFound();

  const { data: allCategories } = await sb.from("categories").select("id, slug");
  const categoryIds = params.slug === "ai-tools"
    ? (allCategories || []).filter((item: any) => String(item.slug || "").startsWith("ai-")).map((item: any) => item.id)
    : [activeCategory.id];
  const toolQuery = sb.from("tools").select("*").eq("status", "published").order("view_count", { ascending: false });
  const { data: rawTools } = categoryIds.length > 1
    ? await toolQuery.in("category_id", categoryIds)
    : category ? await toolQuery.eq("category_id", category.id) : { data: [] };
  const tools = mergeCuratedTools(normalizeTools(rawTools), getCuratedTools({ categorySlug: params.slug }));

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
      <nav className="mb-6 flex items-center gap-2 overflow-x-auto whitespace-nowrap text-sm text-gray-500 scrollbar-hide">
        <Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span>
        <Link href="/categories" className="hover:text-gray-300">ক্যাটাগরি</Link><span>/</span>
        <span className="text-gray-400">{activeCategory.name_bn}</span>
      </nav>
      <div className="mb-8 flex items-start gap-3">
        <span className="text-4xl">{activeCategory.icon}</span>
        <div className="min-w-0"><h1 className="text-2xl font-extrabold text-white sm:text-3xl">{activeCategory.name_bn}</h1><p className="text-gray-400">{activeCategory.description_bn}</p><p className="text-xs text-gray-600 mt-2">{tools.length} টুল পাওয়া গেছে</p></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {(tools || []).map((tool: any) => (
          <Link key={tool.id} href={`/tools/${tool.slug}`} className="glass-card card-hover p-5 group">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">{tool.logo_url ? <Image src={tool.logo_url} alt="" width={32} height={32} className="w-8 h-8 rounded object-contain" /> : <span>🤖</span>}</div>
              <div className="min-w-0"><h3 className="font-semibold text-white group-hover:text-brand-electric transition-colors">{tool.name}</h3><p className="text-xs text-gray-500 truncate">{tool.tagline_bn || tool.tagline}</p></div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
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
