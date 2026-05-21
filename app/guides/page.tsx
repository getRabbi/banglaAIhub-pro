import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = { title: "গাইড" };
export const revalidate = 3600;
export default async function GuidesPage() {
  const { data: items } = await createServerClient().from("guides").select("*").eq("is_active", true).order("published_at", { ascending: false });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">📚 গাইড</h1>
      <p className="text-gray-400 mb-8">AI টুলস ব্যবহারের বিস্তারিত গাইড</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items || []).map((item: any) => (
          <Link key={item.id} href={`/guides/${item.slug}`} className="glass-card card-hover p-5 group">
            <h2 className="font-semibold text-white group-hover:text-brand-electric transition-colors mb-2">{item.title_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{item.description_bn}</p>
            <span className="text-xs text-gray-600">⏱ {item.read_time_min} মিনিট</span>
          </Link>
        ))}
      </div>
      {(!items || items.length === 0) && <p className="text-center text-gray-500 py-20">গাইড শীঘ্রই আসছে!</p>}
    </div>
  );
}
