import Link from "next/link";
import { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: { default: "Admin — BanglaAIHub", template: "%s | Admin" } };

const SIDEBAR = [
  { href: "/admin", icon: "📊", label: "Overview" },
  { href: "/admin/quick-submit", icon: "⚡", label: "Quick Submit" },
  { href: "/admin/scrape-queue", icon: "🤖", label: "Scrape Queue" },
  { href: "/admin/posts", icon: "📝", label: "Posts" },
  { href: "/admin/tools", icon: "🛠️", label: "Tools" },
  { href: "/admin/categories", icon: "📂", label: "Categories" },
  { href: "/admin/comparisons", icon: "⚖️", label: "Comparisons" },
  { href: "/admin/top-lists", icon: "🏆", label: "Top Lists" },
  { href: "/admin/deals", icon: "🔥", label: "Deals" },
  { href: "/admin/social-posts", icon: "📣", label: "Social Posts" },
  { href: "/admin/affiliate-links", icon: "🔗", label: "Affiliate Links" },
  { href: "/admin/newsletter", icon: "📧", label: "Newsletter" },
  { href: "/admin/calendar", icon: "📅", label: "Calendar" },
  { href: "/admin/analytics", icon: "📈", label: "Analytics" },
  { href: "/admin/openclaw-jobs", icon: "🔁", label: "OpenClaw Jobs" },
  { href: "/admin/settings", icon: "⚙️", label: "Settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex bg-[#07080f]">
      {/* Sidebar */}
      <aside className="w-60 shrink-0 border-r border-brand-border bg-[#0a0c14] hidden lg:flex flex-col">
        <div className="p-4 border-b border-brand-border">
          <Link href="/admin" className="flex items-center gap-2">
            <span className="text-xl">🤖</span>
            <span className="font-display font-bold text-white">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 py-2 overflow-y-auto">
          {SIDEBAR.map((item) => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-400 hover:text-white hover:bg-white/5 transition-colors">
              <span className="text-base">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-brand-border">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors block mb-2">← সাইটে ফিরুন</Link>
          <a href="/api/admin/logout" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">Logout</a>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#0a0c14] border-b border-brand-border px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="font-display font-bold text-white">🤖 Admin</Link>
        <Link href="/" className="text-xs text-gray-500">← সাইট</Link>
      </div>

      {/* Content */}
      <main className="flex-1 min-w-0 lg:ml-0 mt-14 lg:mt-0">
        <div className="p-6 lg:p-8 max-w-7xl">{children}</div>
      </main>
    </div>
  );
}
