import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { getCuratedTools } from "@/lib/curated-tools";

export const metadata: Metadata = { title: "ক্যাটাগরি" };
export const revalidate = 3600;

export default async function CategoriesPage() {
  const sb = createServerClient();
  const [{ data: categories }, { data: dbTools }] = await Promise.all([
    sb.from("categories").select("*").order("sort_order"),
    sb.from("tools").select("id, category_id, categories(slug)").eq("status", "published"),
  ]);
  const slugById = new Map((categories || []).map((cat: any) => [cat.id, cat.slug]));
  const dbCountFor = (cat: any) => {
    if (cat.slug === "ai-tools") {
      return (dbTools || []).filter((tool: any) => String(slugById.get(tool.category_id) || "").startsWith("ai-")).length;
    }
    return (dbTools || []).filter((tool: any) => tool.category_id === cat.id).length;
  };
  const displayCount = (cat: any) => Math.max(cat.tool_count || 0, dbCountFor(cat) + getCuratedTools({ categorySlug: cat.slug }).length);

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">📂 AI টুলস ক্যাটাগরি</h1>
      <p className="text-gray-400 mb-8">আপনার প্রয়োজন অনুযায়ী সেরা AI টুল খুঁজুন</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(categories || []).map((cat: any) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="glass-card card-hover p-4 text-center group sm:p-6">
            <span className="text-4xl block mb-3">{cat.icon}</span>
            <h2 className="text-lg font-bold text-white group-hover:text-brand-electric transition-colors mb-1">{cat.name_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{cat.description_bn}</p>
            <span className="text-xs text-gray-600">{displayCount(cat)} টুল</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
