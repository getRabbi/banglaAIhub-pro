import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, List } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'সেরা AI টুলস লিস্ট - BanglaAIHub',
  description: 'শিক্ষার্থী, ফ্রিল্যান্সার, ব্যবসা সহ বিভিন্ন কাজের জন্য সেরা AI টুলসের লিস্ট।',
}
export const revalidate = 3600

export default async function TopListsPage() {
  const supabase = createClient()
  const { data: lists } = await supabase.from('top_lists').select('*')
    .eq('status', 'published').order('view_count', { ascending: false })

  const STATIC = [
    { title: 'শিক্ষার্থীদের জন্য সেরা ১০টি AI টুলস', slug: 'best-ai-for-students', icon: '🎓', count: 10 },
    { title: 'ফ্রিল্যান্সারদের জন্য সেরা AI টুলস', slug: 'best-ai-for-freelancing', icon: '💼', count: 8 },
    { title: 'সম্পূর্ণ ফ্রি ২০টি AI টুলস', slug: 'best-free-ai-tools', icon: '🆓', count: 20 },
    { title: 'YouTube-এর জন্য সেরা AI টুলস', slug: 'best-ai-for-youtube', icon: '📺', count: 7 },
    { title: 'মার্কেটারদের জন্য সেরা AI টুলস', slug: 'best-ai-for-marketing', icon: '📣', count: 9 },
    { title: 'ব্লগারদের জন্য সেরা AI টুলস', slug: 'best-ai-for-bloggers', icon: '✍️', count: 8 },
  ]

  const displayLists = lists && lists.length > 0
    ? lists.map(l => ({ title: l.title, slug: l.slug, icon: '📋', count: l.tool_ids?.length || 0 }))
    : STATIC

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <List className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">কিউরেটেড</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">সেরা AI টুলস লিস্ট</h1>
        <p className="text-gray-500 dark:text-gray-400">বিভিন্ন কাজ ও পেশার জন্য expertদের বাছাই করা AI টুলস</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {displayLists.map((list, i) => (
          <Link key={list.slug} href={`/top-lists/${list.slug}`}
            className="group card-hover p-6 flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-2xl">{list.icon}</div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors leading-snug">{list.title}</h2>
                <p className="text-xs text-gray-400 mt-0.5">{list.count}টি টুলস</p>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
              দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
