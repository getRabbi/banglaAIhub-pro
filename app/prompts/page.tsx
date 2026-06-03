import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
import { CURATED_PROMPTS } from "@/lib/curated-resources";

export const metadata: Metadata = { title: "প্রম্পট লাইব্রেরি" };
export const revalidate = 3600;

export default async function PromptsPage() {
  const sb = createServerClient();
  let { data: items, error } = await sb.from("prompts").select("*").eq("is_active", true).order("view_count", { ascending: false });
  if (error) {
    const fallback = await sb.from("prompts").select("*").eq("is_published", true).order("view_count", { ascending: false });
    items = fallback.data;
  }
  const prompts = items && items.length > 0 ? items : CURATED_PROMPTS;

  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">💡 প্রম্পট লাইব্রেরি</h1>
      <p className="text-gray-400 mb-8">AI টুলসের জন্য রেডিমেড প্রম্পট — কপি করে ব্যবহার করুন</p>
      {(!items || items.length === 0) && (
        <div className="glass-card glow-blue p-5 mb-8">
          <p className="text-sm text-gray-300 leading-7">ডাটাবেসে prompt না থাকলেও BanglaAIHub curated prompt pack live আছে। প্রতিটি prompt practical কাজের জন্য তৈরি, detail page থেকে copy করে সরাসরি ব্যবহার করতে পারবেন।</p>
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map((p: any) => (
          <Link key={p.id || p.slug} href={`/prompts/${p.slug}`} className="glass-card card-hover p-5 group min-h-[190px] flex flex-col">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <span className="text-xs px-2.5 py-1 rounded-full bg-violet-500/10 text-violet-300 border border-violet-500/20">{p.category || "prompt"}</span>
              <span className="text-xs text-gray-600 truncate">{p.tool_name || "সব AI"}</span>
            </div>
            <h2 className="font-semibold text-white group-hover:text-brand-violet transition-colors mb-2">{p.title_bn || p.title}</h2>
            <p className="text-sm text-gray-500 line-clamp-3 mb-4">{p.description_bn}</p>
            <span className="mt-auto text-sm text-brand-electric">প্রম্পট দেখুন →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
