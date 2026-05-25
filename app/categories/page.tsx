import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";

export const metadata: Metadata = { title: "ক্যাটাগরি" };
export const revalidate = 3600;

export default async function CategoriesPage() {
  const { data: categories } = await createServerClient().from("categories").select("*").order("sort_order");
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">📂 AI টুলস ক্যাটাগরি</h1>
      <p className="text-gray-400 mb-8">আপনার প্রয়োজন অনুযায়ী সেরা AI টুল খুঁজুন</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {(categories || []).map((cat: any) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`} className="glass-card card-hover p-6 text-center group">
            <span className="text-4xl block mb-3">{cat.icon}</span>
            <h2 className="text-lg font-bold text-white group-hover:text-brand-electric transition-colors mb-1">{cat.name_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{cat.description_bn}</p>
            <span className="text-xs text-gray-600">{cat.tool_count} টুল</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
