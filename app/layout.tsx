import "./globals.css";
import { Metadata, Viewport } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: { default: "BanglaAIHub — বাংলায় সেরা AI টুলস", template: "%s | BanglaAIHub" },
  description: "বাংলায় সেরা AI টুলস ডিরেক্টরি — অনলাইন আয়, AI টুলস রিভিউ, টেক গাইড, ডিল ও প্রোম্পট লাইব্রেরি",
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#08090d",
};

const NAV_LINKS = [
  { href: "/tools", label: "টুলস" },
  { href: "/blog", label: "ব্লগ" },
  { href: "/prompts", label: "প্রোম্পট" },
  { href: "/guides", label: "গাইড" },
  { href: "/make-money", label: "আয় করুন" },
  { href: "/deals", label: "ডিলস" },
  { href: "/categories", label: "ক্যাটাগরি" },
];

const FOOTER_LINKS = [
  { label: "ক্যাটাগরি", links: [{ href: "/categories", label: "সব ক্যাটাগরি" }, { href: "/compare", label: "তুলনা" }, { href: "/top-lists", label: "টপ লিস্ট" }] },
  { label: "রিসোর্স", links: [{ href: "/resources", label: "ফ্রি রিসোর্স" }, { href: "/glossary", label: "গ্লসারি" }, { href: "/find-tool", label: "টুল ফাইন্ডার" }] },
  { label: "সাইট", links: [{ href: "/about", label: "আমাদের সম্পর্কে" }, { href: "/contact", label: "যোগাযোগ" }, { href: "/privacy", label: "প্রাইভেসি" }, { href: "/disclaimer", label: "ডিসক্লেইমার" }] },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="bn" className="dark">
      <body className="min-h-screen flex flex-col bg-brand-navy text-slate-100 antialiased">
        {/* ─── Navbar ─── */}
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-brand-navy/88 backdrop-blur-xl" aria-label="Primary navigation">
          <div className="page-shell h-16 flex items-center justify-between gap-3">
            <Link href="/" className="flex items-center gap-2.5 shrink-0" aria-label="BanglaAIHub home">
              <span className="grid h-9 w-9 place-items-center rounded-lg border border-brand-electric/25 bg-brand-electric/10 text-sm font-black text-brand-electric">AI</span>
              <span className="text-lg sm:text-xl font-bold text-white font-display leading-none">Bangla<span className="text-brand-electric">AI</span>Hub</span>
            </Link>
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((l) => (
                <Link key={l.href} href={l.href} className="min-h-10 px-3 py-2 rounded-lg text-sm font-semibold text-gray-400 hover:bg-white/[0.06] hover:text-white transition-colors">{l.label}</Link>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <Link href="/find-tool" className="hidden sm:inline-flex min-h-10 items-center rounded-lg border border-emerald-400/20 bg-emerald-400/10 px-3 py-2 text-sm font-bold text-emerald-200 hover:border-emerald-300/40 hover:text-white transition-all">
                টুল ফাইন্ডার
              </Link>
              <Link href="/search" className="flex min-h-10 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-gray-300 hover:border-brand-electric/40 hover:text-white transition-all">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              <span className="hidden sm:inline">খুঁজুন...</span>
              </Link>
            </div>
          </div>
          {/* Mobile nav */}
          <div className="lg:hidden page-shell flex gap-2 pb-3 overflow-x-auto scrollbar-hide">
            <Link href="/find-tool" className="chip">টুল ফাইন্ডার</Link>
            {NAV_LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="chip">{l.label}</Link>
            ))}
          </div>
        </nav>

        {/* ─── Main ─── */}
        <main className="flex-1 w-full">{children}</main>

        {/* ─── Footer ─── */}
        <footer className="border-t border-white/10 bg-brand-dark/90">
          <div className="page-shell py-10 sm:py-12">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="sm:col-span-2 lg:col-span-1">
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <span className="grid h-8 w-8 place-items-center rounded-lg border border-brand-electric/25 bg-brand-electric/10 text-xs font-black text-brand-electric">AI</span>
                  <span className="font-bold text-white font-display">Bangla<span className="text-brand-electric">AI</span>Hub</span>
                </Link>
                <p className="max-w-sm text-sm text-gray-400 leading-7">বাংলায় সেরা AI টুলস ডিরেক্টরি, রিভিউ, গাইড, ডিল এবং অনলাইন আয়ের practical রিসোর্স।</p>
              </div>
              {FOOTER_LINKS.map((section) => (
                <div key={section.label}>
                  <h4 className="text-sm font-bold text-gray-200 mb-3">{section.label}</h4>
                  <ul className="space-y-1.5">
                    {section.links.map((l) => (
                      <li key={l.href}><Link href={l.href} className="inline-flex min-h-8 items-center text-sm text-gray-500 hover:text-gray-200 transition-colors">{l.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-xs text-gray-600 text-center sm:text-left">© {new Date().getFullYear()} BanglaAIHub। সর্বস্বত্ব সংরক্ষিত।</p>
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
