import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight, GitCompare } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI টুলস তুলনা - BanglaAIHub',
  description: 'ChatGPT vs Claude, Midjourney vs Leonardo সহ সেরা AI টুলসের বিস্তারিত তুলনা বাংলায়।',
}
export const revalidate = 3600

const STATIC_COMPARISONS = [
  { title: 'ChatGPT vs Claude', slug: 'chatgpt-vs-claude', tools: ['ChatGPT', 'Claude'], category: 'AI Chatbot' },
  { title: 'ChatGPT vs Gemini', slug: 'chatgpt-vs-gemini', tools: ['ChatGPT', 'Gemini'], category: 'AI Chatbot' },
  { title: 'Midjourney vs Leonardo AI', slug: 'midjourney-vs-leonardo', tools: ['Midjourney', 'Leonardo AI'], category: 'AI Image' },
  { title: 'Runway vs Pictory', slug: 'runway-vs-pictory', tools: ['Runway', 'Pictory'], category: 'AI Video' },
  { title: 'Jasper vs Copy.ai', slug: 'jasper-vs-copyai', tools: ['Jasper', 'Copy.ai'], category: 'AI Writing' },
  { title: 'Notion AI vs ChatGPT', slug: 'notion-ai-vs-chatgpt', tools: ['Notion AI', 'ChatGPT'], category: 'Productivity' },
]

export default async function ComparePage() {
  const supabase = createClient()
  const { data: comparisons } = await supabase.from('comparisons')
    .select('id, title, slug, tool_ids, view_count')
    .eq('status', 'published')
    .order('view_count', { ascending: false })

  const display = comparisons && comparisons.length > 0
    ? comparisons.map((c: any) => ({ title: c.title, slug: c.slug, tools: [], category: '' }))
    : STATIC_COMPARISONS

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <GitCompare className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">পাশাপাশি তুলনা</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI টুলস তুলনা</h1>
        <p className="text-gray-500 dark:text-gray-400">কোন AI টুল আপনার জন্য ভালো? বিস্তারিত তুলনা দেখুন</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {display.map((comp) => (
          <Link key={comp.slug} href={`/compare/${comp.slug}`}
            className="group card-hover p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                <GitCompare className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {comp.title}
                </h2>
                {comp.category && <span className="text-xs text-gray-400">{comp.category}</span>}
              </div>
            </div>
            {comp.tools.length > 0 && (
              <div className="flex gap-2">
                {comp.tools.map((tool) => (
                  <span key={tool} className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-lg">{tool}</span>
                ))}
              </div>
            )}
            <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-auto">
              তুলনা দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
