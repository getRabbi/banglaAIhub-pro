import "./globals.css";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "BanglaAIHub — বাংলায় সেরা AI টুলস", template: "%s | BanglaAIHub" },
  description: "বাংলায় সেরা AI টুলস ডিরেক্টরি — অনলাইন আয়, AI টুলস রিভিউ, টেক গাইড, ডিল ও প্রোম্পট লাইব্রেরি",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com"),
};

const NAV_LINKS = [
  { href: "/tools", label: "টুলস" },
  { href: "/blog", label: "ব্লগ" },
  { href: "/deals", label: "ডিলস" },
  { href: "/prompts", label: "প্রোম্পট" },
  { href: "/guides", label: "গাইড" },
  { href: "/make-money", label: "আয় করুন" },
];

const FOOTER_LINKS = [
  { label: "ক্যাটাগরি", links: [{ href: "/categories", label: "সব ক্যাটাগরি" }, { href: "/compare", label: "তুলনা" }, { href: "/top-lists", label: "টপ লিস্ট" }] },
  { label: "রিসোর্স", links: [{ href: "/resources", label: "ফ্রি রিসোর্স" }, { href: "/glossary", label: "গ্লসারি" }, { href: "/find-tool", label: "টুল ফাইন্ডার" }] },
  { label: "সাইট", links: [{ href: "/about", label: "আমাদের সম্পর্কে" }, { href: "/contact", label: "যোগাযোগ" }, { href: "/privacy", label: "প্রাইভেসি" }, { href: "/disclaimer", label: "ডিসক্লেইমার" }] },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className="min-h-screen flex flex-col">
        {/* ─── Navbar ─── */}
        <nav className="sticky top-0 z-50 glass border-b border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-2xl">🤖</span>
              <span className="text-lg font-bold gradient-text font-display">BanglaAIHub</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
            <Link href="/search" className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-500 hover:border-white/20 transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span className="hidden sm:inline">খুঁজুন...</span>
            </Link>
          </div>
          {/* Mobile nav */}
          <div className="md:hidden flex gap-1 px-4 pb-2 overflow-x-auto scrollbar-hide">
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="text-xs text-gray-500 hover:text-white whitespace-nowrap px-2 py-1 rounded-full hover:bg-white/5 transition-all">{l.label}</Link>
            ))}
          </div>
        </nav>

        {/* ─── Main ─── */}
        <main className="flex-1">{children}</main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/5 bg-[#080b14]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              <div>
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🤖</span>
                  <span className="font-bold gradient-text font-display">BanglaAIHub</span>
                </Link>
                <p className="text-sm text-gray-500 leading-relaxed">বাংলায় সেরা AI টুলস ডিরেক্টরি ও রিসোর্স হাব।</p>
              </div>
              {FOOTER_LINKS.map((section) => (
                <div key={section.label}>
                  <h4 className="text-sm font-semibold text-gray-300 mb-3">{section.label}</h4>
                  <ul className="space-y-2">
                    {section.links.map((l) => (
                      <li key={l.href}><Link href={l.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600">© {new Date().getFullYear()} BanglaAIHub। সর্বস্বত্ব সংরক্ষিত।</p>
              <div className="flex items-center gap-4">
                <Link href="/feed.xml" className="text-xs text-gray-600 hover:text-gray-400">RSS</Link>
                <Link href="/contact" className="text-xs text-gray-600 hover:text-gray-400">যোগাযোগ</Link>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
