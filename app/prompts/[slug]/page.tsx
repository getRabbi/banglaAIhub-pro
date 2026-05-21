"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
// This is a client page — fetches from API
export default function PromptDetail({ params }: { params: { slug: string } }) {
  const [prompt, setPrompt] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    fetch(`/api/search?type=prompt&slug=${params.slug}`).then(r => r.json()).then(d => setPrompt(d)).catch(() => {});
  }, [params.slug]);
  if (!prompt) return <div className="max-w-2xl mx-auto px-4 py-20 text-center text-gray-500">লোড হচ্ছে...</div>;
  const handleCopy = () => { navigator.clipboard.writeText(prompt.prompt_text); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8"><Link href="/" className="hover:text-gray-300">হোম</Link><span>/</span><Link href="/prompts" className="hover:text-gray-300">প্রম্পট</Link></nav>
      <h1 className="text-2xl font-extrabold text-white mb-4">{prompt.title_bn}</h1>
      <p className="text-gray-400 mb-6">{prompt.description_bn}</p>
      {prompt.use_case_bn && <div className="glass-card p-4 mb-6"><h3 className="text-sm font-semibold text-gray-400 mb-2">📋 ব্যবহার</h3><p className="text-gray-300 text-sm">{prompt.use_case_bn}</p></div>}
      <div className="glass-card p-6 relative">
        <button onClick={handleCopy} className="absolute top-3 right-3 btn-secondary text-xs">{copied ? "✓ কপি হয়েছে" : "📋 কপি"}</button>
        <pre className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">{prompt.prompt_text}</pre>
      </div>
    </div>
  );
}
