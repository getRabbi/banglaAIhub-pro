import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ToolCard from '@/components/tools/ToolCard'
import Link from 'next/link'
import { ChevronRight, Filter } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { params: { slug: string }; searchParams: { sort?: string; pricing?: string; page?: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: cat } = await supabase.from('categories').select('name_bn, description_bn').eq('slug', params.slug).single()
  if (!cat) return { title: 'Not Found' }
  return { title: `${cat.name_bn} - BanglaAIHub`, description: cat.description_bn || '' }
}

export const revalidate = 3600

export default async function CategoryPage({ params, searchParams }: Props) {
  const supabase = createClient()
  const { sort = 'popular', pricing, page = '1' } = searchParams
  const PER_PAGE = 18
  const offset = (parseInt(page) - 1) * PER_PAGE

  const { data: category } = await supabase.from('categories').select('*').eq('slug', params.slug).single()
  if (!category) notFound()

  let q = supabase.from('tools')
    .select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)', { count: 'exact' })
    .eq('status', 'published')
    .eq('category_id', category.id)
    .range(offset, offset + PER_PAGE - 1)

  if (pricing) q = q.eq('pricing_type', pricing)
  if (sort === 'popular') q = q.order('view_count', { ascending: false })
  else if (sort === 'rating') q = q.order('overall_rating', { ascending: false })
  else if (sort === 'newest') q = q.order('created_at', { ascending: false })

  const { data: tools, count } = await q
  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  const buildUrl = (params: Record<string, string>) => {
    const sp = new URLSearchParams({ sort, ...(pricing ? { pricing } : {}), ...params })
    return `/categories/${category.slug}?${sp.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">হোম</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/categories" className="hover:text-blue-600">ক্যাটাগরি</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{category.name_bn}</span>
      </nav>

      {/* Header */}
      <div className="flex items-start gap-5 mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-4xl shrink-0"
          style={{ backgroundColor: `${category.color}15` }}>
          {category.icon}
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">{category.name_bn}</h1>
          {category.description_bn && <p className="text-gray-500 dark:text-gray-400">{category.description_bn}</p>}
          <p className="text-sm text-gray-400 mt-1">{count || 0}টি টুলস পাওয়া গেছে</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1 text-sm text-gray-500"><Filter className="w-4 h-4" /> ফিল্টার:</div>
        <div className="flex gap-2 flex-wrap">
          {['popular', 'rating', 'newest'].map(s => (
            <Link key={s} href={buildUrl({ sort: s, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${sort === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {s === 'popular' ? 'জনপ্রিয়' : s === 'rating' ? 'রেটিং' : 'নতুন'}
            </Link>
          ))}
        </div>
        <div className="flex gap-2 flex-wrap ml-2">
          {[['', 'সব'], ['free', 'ফ্রি'], ['freemium', 'ফ্রিমিয়াম'], ['paid', 'পেইড']].map(([val, label]) => (
            <Link key={val} href={buildUrl({ pricing: val, page: '1' })}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${(pricing || '') === val ? 'bg-purple-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
              {label}
            </Link>
          ))}
        </div>
      </div>

      {/* Tools */}
      {tools && tools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {tools.map((tool: any) => <ToolCard key={tool.id} tool={tool} showCategory={false} />)}
          </div>
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <Link key={p} href={buildUrl({ page: p.toString() })}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${parseInt(page) === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}>
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-gray-500">এই ক্যাটাগরিতে এখনো টুলস যুক্ত হয়নি</div>
      )}
    </div>
  )
}
