import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { Metadata } from "next";
export const metadata: Metadata = { title: "ফ্রি রিসোর্স" };
export const revalidate = 3600;
export default async function ResourcesPage() {
  const { data: items } = await createServerClient().from("resources").select("*").eq("is_active", true).order("view_count", { ascending: false });
  return (
    <div className="mx-auto max-w-7xl px-3 py-8 sm:px-6 sm:py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2">🎁 ফ্রি রিসোর্স</h1>
      <p className="text-gray-400 mb-8">ফ্রি ই-বুক, টেমপ্লেট, চেকলিস্ট এবং আরো</p>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(items || []).map((r: any) => (
          <Link key={r.id} href={`/resources/${r.slug}`} className="glass-card card-hover p-5 group">
            <h2 className="font-semibold text-white group-hover:text-brand-green transition-colors mb-2">{r.title_bn}</h2>
            <p className="text-sm text-gray-500 line-clamp-2 mb-2">{r.description_bn}</p>
            <span className="text-xs text-gray-600">📥 {r.resource_type}</span>
          </Link>
        ))}
      </div>
      {(!items || items.length === 0) && <p className="text-center text-gray-500 py-20">রিসোর্স শীঘ্রই আসছে!</p>}
    </div>
  );
}
