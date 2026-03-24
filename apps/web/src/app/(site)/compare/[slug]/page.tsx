import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, CheckCircle, XCircle, Trophy } from 'lucide-react'
import ShareButtons from '@/components/blog/ShareButtons'
import ToolCard from '@/components/tools/ToolCard'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data } = await supabase.from('comparisons').select('title, meta_description').eq('slug', params.slug).single()
  if (!data) return { title: 'Not Found' }
  return { title: `${data.title} - BanglaAIHub`, description: data.meta_description || '' }
}
export const revalidate = 3600

export default async function CompareDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: comp } = await supabase.from('comparisons').select('*').eq('slug', params.slug).eq('status', 'published').single()
  if (!comp) notFound()

  supabase.from('comparisons').update({ view_count: comp.view_count + 1 }).eq('id', comp.id)

  let tools: any[] = []
  if (comp.tool_ids?.length > 0) {
    const { data } = await supabase.from('tools')
      .select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)')
      .in('id', comp.tool_ids).eq('status', 'published')
    tools = data || []
  }

  const url = `${process.env.NEXT_PUBLIC_SITE_URL}/compare/${comp.slug}`

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">হোম</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/compare" className="hover:text-blue-600">তুলনা</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{comp.title}</span>
      </nav>

      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">{comp.title}</h1>

      {/* Winner */}
      {comp.winner_tool_id && tools.length > 0 && (
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl mb-8 flex items-start gap-3">
          <Trophy className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-800 dark:text-amber-300">
              বিজয়ী: {tools.find(t => t.id === comp.winner_tool_id)?.name}
            </p>
            {comp.winner_reason_bn && (
              <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">{comp.winner_reason_bn}</p>
            )}
          </div>
        </div>
      )}

      {/* Tool cards side by side */}
      {tools.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {tools.map((tool) => (
            <div key={tool.id} className={`relative ${comp.winner_tool_id === tool.id ? 'ring-2 ring-amber-400 rounded-xl' : ''}`}>
              {comp.winner_tool_id === tool.id && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-400 text-white text-xs font-bold px-3 py-0.5 rounded-full z-10">
                  🏆 সেরা পছন্দ
                </div>
              )}
              <ToolCard tool={tool} />
            </div>
          ))}
        </div>
      )}

      {/* Comparison table */}
      {comp.comparison_table?.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Feature তুলনা</h2>
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
                  <th className="px-4 py-3 text-left text-gray-600 dark:text-gray-400 font-medium">Feature</th>
                  {tools.map(t => (
                    <th key={t.id} className="px-4 py-3 text-center text-gray-900 dark:text-white font-semibold">{t.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {comp.comparison_table.map((row: any, i: number) => (
                  <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                    <td className="px-4 py-3 font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
                    {tools.map(t => {
                      const val = row.values?.[t.id] || row.values?.[t.name] || '—'
                      const isCheck = val === 'true' || val === '✓'
                      const isCross = val === 'false' || val === '✗'
                      return (
                        <td key={t.id} className="px-4 py-3 text-center">
                          {isCheck ? <CheckCircle className="w-5 h-5 text-green-500 mx-auto" /> :
                           isCross ? <XCircle className="w-5 h-5 text-red-400 mx-auto" /> :
                           <span className="text-gray-700 dark:text-gray-300">{val}</span>}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content */}
      {comp.content_bn && (
        <div className="prose-bangla mb-8" dangerouslySetInnerHTML={{ __html: comp.content_bn }} />
      )}

      <ShareButtons url={url} title={comp.title} />
    </div>
  )
}
