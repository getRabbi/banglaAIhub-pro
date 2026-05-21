import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = { title: "প্রম্পট লাইব্রেরি" };
export const revalidate = 3600;
export default async function PromptsPage() {
  const { data: items } = await createServerClient().from("prompts").select("*").eq("is_active", true).order("view_count", { ascending: false });
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">💡 প্রম্পট লাইব্রেরি</h1>
      <p className="text-gray-400 mb-8">AI টুলসের জন্য রেডিমেড প্রম্পট — কপি করে ব্যবহার করুন</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items || []).map((p: any) => (
          <Link key={p.id} href={`/prompts/${p.slug}`} className="glass-card card-hover p-5 group">
            <h2 className="font-semibold text-white group-hover:text-brand-violet transition-colors mb-2">{p.title_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{p.description_bn}</p>
            <div className="flex gap-2"><span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{p.tool_name || "সব AI"}</span><span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400">{p.category}</span></div>
          </Link>
        ))}
      </div>
      {(!items || items.length === 0) && <p className="text-center text-gray-500 py-20">প্রম্পট শীঘ্রই আসছে!</p>}
    </div>
  );
}
