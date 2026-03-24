import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ToolCard from '@/components/tools/ToolCard'
import ShareButtons from '@/components/blog/ShareButtons'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('top_lists').select('title, meta_description').eq('slug', params.slug).single()
  if (!data) return { title: 'Not Found' }
  return { title: `${data.title} - BanglaAIHub`, description: data.meta_description || '' }
}
export const revalidate = 3600

export default async function TopListDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: list } = await supabase.from('top_lists').select('*').eq('slug', params.slug).eq('status', 'published').single()
  if (!list) notFound()

  supabase.from('top_lists').update({ view_count: list.view_count + 1 }).eq('id', list.id)

  let tools: any[] = []
  if (list.tool_ids?.length > 0) {
    const { data } = await supabase.from('tools')
      .select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)')
      .in('id', list.tool_ids).eq('status', 'published')
    tools = list.tool_ids.map((id: string) => data?.find((t: any) => t.id === id)).filter(Boolean)
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/top-lists/${list.slug}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">হোম</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/top-lists" className="hover:text-blue-600">টপ লিস্ট</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white truncate">{list.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{list.title}</h1>
      {list.description_bn && <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg leading-relaxed">{list.description_bn}</p>}

      {list.content_bn && (
        <div className="prose-bangla mb-8" dangerouslySetInnerHTML={{ __html: list.content_bn }} />
      )}

      <div className="space-y-4 mb-10">
        {tools.map((tool, i) => (
          <div key={tool.id} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0 mt-1">
              {i + 1}
            </div>
            <div className="flex-1">
              <ToolCard tool={tool} />
            </div>
          </div>
        ))}
        {tools.length === 0 && (
          <p className="text-center py-10 text-gray-500">এই লিস্টে এখনো টুলস যুক্ত হয়নি</p>
        )}
      </div>

      <ShareButtons url={url} title={list.title} />
    </div>
  )
}
