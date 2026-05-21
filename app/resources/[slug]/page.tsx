import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatMarkdown } from "@/lib/constants";
export const revalidate = 3600;
export default async function ResourceDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: item } = await sb.from("resources").select("*").eq("slug", params.slug).eq("is_active", true).single();
  if (!item) notFound();
  try {
    await sb.rpc("increment_view", { tbl: "resources", slug_val: params.slug });
  } catch {
    // View counts should not block page rendering.
  }
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8"><Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span><Link href="/resources" className="hover:text-gray-300">রিসোর্স</Link></nav>
      <h1 className="text-3xl font-extrabold text-white mb-4">{item.title_bn}</h1>
      <p className="text-gray-400 mb-6">{item.description_bn}</p>
      {item.body_bn && <div className="prose prose-lg prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: formatMarkdown(item.body_bn) }} />}
      {item.download_url && (
        <div className="glass-card glow-blue p-6 mt-8 text-center">
          <a href={item.download_url} target="_blank" rel="noopener noreferrer" className="btn-primary inline-block">📥 ডাউনলোড করুন</a>
        </div>
      )}
    </div>
  );
}
