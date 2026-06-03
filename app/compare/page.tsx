import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = { title: "AI টুলস তুলনা" };
export const revalidate = 3600;
export default async function ComparePage() {
  const { data: items } = await createServerClient().from("comparisons").select("*").eq("is_active", true).order("view_count", { ascending: false });
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">⚖️ AI টুলস তুলনা</h1>
      <p className="text-gray-400 mb-8">সেরা AI টুলস পাশাপাশি তুলনা করুন</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items || []).map((item: any) => (
          <Link key={item.id} href={`/compare/${item.slug}`} className="glass-card card-hover p-5 group">
            <h2 className="font-semibold text-white group-hover:text-brand-electric transition-colors mb-2">{item.title_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-3">{item.description_bn}</p>
            <span className="text-xs text-gray-600">👁 {item.view_count}</span>
          </Link>
        ))}
      </div>
      {(!items || items.length === 0) && <p className="text-center text-gray-500 py-20">তুলনা শীঘ্রই আসছে!</p>}
    </div>
  );
}
