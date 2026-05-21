"use client";
import { useState } from "react";
import Link from "next/link";

const NAV_LINKS = [
  { href: "/tools", label: "টুলস", emoji: "🛠️" },
  { href: "/blog", label: "ব্লগ", emoji: "📝" },
  { href: "/categories", label: "ক্যাটাগরি", emoji: "📂" },
  { href: "/deals", label: "ডিলস", emoji: "🔥" },
  { href: "/make-money", label: "আয় করুন", emoji: "💰" },
  { href: "/find-tool", label: "টুল খুঁজুন", emoji: "🔍" },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <>
      <nav className="sticky top-0 z-50 bg-brand-navy/95 backdrop-blur-lg border-b border-brand-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0">
              <span className="text-2xl">🤖</span>
              <span className="font-display font-bold text-xl text-white">
                Bangla<span className="text-brand-electric">AI</span>Hub
              </span>
            </Link>

            {/* Desktop nav */}
            <div className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="px-3 py-2 text-sm text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right side */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                aria-label="Search"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>

              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="lg:hidden p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-lg"
                aria-label="Menu"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  {mobileOpen
                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/>
                  }
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-brand-border bg-brand-dark animate-slide-in">
            <div className="px-4 py-3 space-y-1">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 text-gray-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                >
                  <span>{link.emoji}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Search modal */}
      {searchOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[15vh]" onClick={() => setSearchOpen(false)}>
          <div className="w-full max-w-xl mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
            <form action="/search" method="GET" className="relative">
              <input
                name="q"
                type="text"
                autoFocus
                placeholder="AI টুল খুঁজুন বা টপিক সার্চ করুন..."
                className="w-full px-5 py-4 rounded-2xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 text-lg focus:outline-none focus:border-brand-blue/50 focus:ring-2 focus:ring-brand-blue/20"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
              </button>
            </form>
            <p className="text-center text-gray-600 text-sm mt-3">ESC চাপুন বন্ধ করতে</p>
          </div>
        </div>
      )}
    </>
  );
}
