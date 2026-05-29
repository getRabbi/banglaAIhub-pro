import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { CURATED_GUIDES } from "@/lib/curated-resources";

export const metadata: Metadata = { title: "গাইড" };
export const revalidate = 3600;

export default async function GuidesPage() {
  const sb = createServerClient();
  let { data: items, error } = await sb.from("guides").select("*").eq("is_active", true).order("published_at", { ascending: false });
  if (error) {
    const fallback = await sb.from("guides").select("*").eq("is_published", true).order("created_at", { ascending: false });
    items = fallback.data;
  }
  const guides = items && items.length > 0 ? items : CURATED_GUIDES;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">📚 গাইড</h1>
      <p className="text-gray-400 mb-8">AI টুলস ব্যবহারের বিস্তারিত গাইড</p>
      {(!items || items.length === 0) && (
        <div className="glass-card glow-blue p-5 mb-8">
          <p className="text-sm text-gray-300 leading-7">ডাটাবেসে guide না থাকলেও curated starter guides live আছে। এগুলো AI tool selection, content workflow, automation এবং prompt writing নিয়ে practical roadmap হিসেবে সাজানো।</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {guides.map((item: any) => (
          <Link key={item.id || item.slug} href={`/guides/${item.slug}`} className="glass-card card-hover p-5 group min-h-[180px] flex flex-col">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-xs px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">Guide</span>
              <span className="text-xs text-gray-600">⏱ {item.read_time_min || 5} মিনিট</span>
            </div>
            <h2 className="font-semibold text-white group-hover:text-brand-electric transition-colors mb-2">{item.title_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4">{item.description_bn || item.meta_description || item.body_bn?.slice(0, 150)}</p>
            <span className="mt-auto text-sm text-brand-electric">গাইড পড়ুন →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
