import { createServerClient } from "@/lib/supabase";
import { Metadata } from "next";
export const metadata: Metadata = { title: "AI শব্দকোষ" };
export default async function GlossaryPage() {
  const sb = createServerClient();
  let { data: terms, error } = await sb.from("glossary").select("*").order("term");
  if (error) {
    const fallback = await sb.from("glossary_terms").select("*").eq("is_published", true).order("term");
    terms = fallback.data;
  }
  const grouped: Record<string, any[]> = {};
  (terms || []).forEach((t: any) => { const l = t.term[0].toUpperCase(); if (!grouped[l]) grouped[l] = []; grouped[l].push(t); });
  return (<div className="max-w-4xl mx-auto px-4 sm:px-6 py-10"><h1 className="text-3xl font-extrabold text-white mb-8">📖 AI শব্দকোষ</h1>{Object.entries(grouped).map(([l,items])=>(<div key={l} className="mb-8"><h2 className="text-2xl font-bold text-brand-electric mb-4 border-b border-brand-border pb-2">{l}</h2><div className="space-y-4">{items.map((t:any)=>(<div key={t.id} className="glass-card p-5"><h3 className="font-bold text-white">{t.term} <span className="text-sm text-gray-500 font-normal">({t.term_bn})</span></h3><p className="text-gray-300 text-sm mt-1">{t.definition_bn}</p></div>))}</div></div>))}{(!terms||terms.length===0)&&<p className="text-center text-gray-500 py-20">শব্দকোষ শীঘ্রই আসছে!</p>}</div>);
}
