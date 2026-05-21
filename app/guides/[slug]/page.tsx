import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMarkdown } from "@/lib/constants";
export const revalidate = 3600;
export default async function GuideDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: item } = await sb.from("guides").select("*").eq("slug", params.slug).eq("is_active", true).single();
  if (!item) notFound();
  try {
    await sb.rpc("increment_view", { tbl: "guides", slug_val: params.slug });
  } catch {
    // View counts should not block page rendering.
  }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8"><Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span><Link href="/guides" className="hover:text-gray-300">গাইড</Link></nav>
      <h1 className="text-3xl font-extrabold text-white mb-2">{item.title_bn}</h1>
      <p className="text-sm text-gray-500 mb-8">⏱ {item.read_time_min} মিনিট · 👁 {item.view_count}</p>
      <div className="prose prose-lg prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(item.body_bn) }} />
    </div>
  );
}
