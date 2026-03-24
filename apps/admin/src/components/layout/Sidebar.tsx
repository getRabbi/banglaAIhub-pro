'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Zap, Inbox, FileText, Wrench, FolderOpen,
  GitCompare, List, Tag, Link2, Share2, Mail, BarChart2,
  Bot, Settings, ChevronRight, X, Calendar,
} from 'lucide-react'

const NAV = [
  { label: 'Overview', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quick Submit', href: '/quick-submit', icon: Zap, highlight: true },
  { divider: true, label: 'Content' },
  { label: 'Scrape Queue', href: '/scrape-queue', icon: Inbox },
  { label: 'Posts', href: '/posts', icon: FileText },
  { label: 'Calendar', href: '/calendar', icon: Calendar },
  { divider: true, label: 'Directory' },
  { label: 'Tools', href: '/tools', icon: Wrench },
  { label: 'Categories', href: '/categories', icon: FolderOpen },
  { label: 'Comparisons', href: '/comparisons', icon: GitCompare },
  { label: 'Top Lists', href: '/top-lists', icon: List },
  { label: 'Deals', href: '/deals', icon: Tag },
  { divider: true, label: 'Growth' },
  { label: 'Affiliate Links', href: '/affiliate-links', icon: Link2 },
  { label: 'Social Posts', href: '/social-posts', icon: Share2 },
  { label: 'Newsletter', href: '/newsletter', icon: Mail },
  { divider: true, label: 'System' },
  { label: 'Analytics', href: '/analytics', icon: BarChart2 },
  { label: 'OpenClaw Jobs', href: '/openclaw-jobs', icon: Bot },
  { label: 'Settings', href: '/settings', icon: Settings },
]

interface Props { onClose?: () => void }

export default function Sidebar({ onClose }: Props) {
  const pathname = usePathname()

  return (
    <aside className="w-60 h-full bg-gray-950 border-r border-gray-800 flex flex-col">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-white font-display">BanglaAIHub</div>
            <div className="text-xs text-gray-500">Admin Panel</div>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-800 text-gray-400 lg:hidden">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map((item, i) => {
          if ('divider' in item && item.divider) {
            return (
              <div key={i} className="px-2 pt-4 pb-1">
                <span className="text-xs font-semibold text-gray-600 uppercase tracking-wider">{item.label}</span>
              </div>
            )
          }
          if (!('href' in item)) return null
          const Icon = item.icon!
          const isActive = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href!))
          return (
            <Link key={item.href} href={item.href!}
              onClick={onClose}
              className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 group ${
                item.highlight
                  ? isActive
                    ? 'bg-blue-600 text-white'
                    : 'bg-blue-600/10 text-blue-400 hover:bg-blue-600 hover:text-white border border-blue-800'
                  : isActive
                    ? 'bg-gray-800 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-gray-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
              {isActive && !item.highlight && <ChevronRight className="w-3.5 h-3.5 opacity-50" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-gray-800">
        <a href={process.env.NEXT_PUBLIC_SITE_URL || 'https://banglaAIhub.com'}
          target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-500 hover:text-gray-300 hover:bg-gray-800 transition-all"
        >
          <span>সাইট দেখুন</span>
          <ChevronRight className="w-3.5 h-3.5 ml-auto" />
        </a>
      </div>
    </aside>
  )
}
