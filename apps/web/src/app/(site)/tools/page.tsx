import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/tools/ToolCard'
import ToolFilters from '@/components/tools/ToolFilters'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'সব AI টুলস - BanglaAIHub',
  description: '৫০০+ AI টুলসের বাংলা রিভিউ। ফ্রি, ফ্রিমিয়াম, পেইড সব ধরনের AI টুলস বাংলায় জানুন।',
}

export const revalidate = 3600

interface Props {
  searchParams: { filter?: string; category?: string; pricing?: string; sort?: string; page?: string }
}

export default async function ToolsPage({ searchParams }: Props) {
  const supabase = createClient()
  const { filter, category, pricing, sort = 'popular', page = '1' } = searchParams
  const PER_PAGE = 24
  const offset = (parseInt(page) - 1) * PER_PAGE

  let query = supabase
    .from('tools')
    .select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)', { count: 'exact' })
    .eq('status', 'published')

  if (filter === 'trending') query = query.eq('is_trending', true)
  if (filter === 'new') query = query.eq('is_new', true)
  if (filter === 'free') query = query.eq('has_free_plan', true)
  if (filter === 'editors') query = query.eq('is_editors_choice', true)
  if (category) query = query.eq('categories.slug', category)
  if (pricing) query = query.eq('pricing_type', pricing)

  if (sort === 'popular') query = query.order('view_count', { ascending: false })
  else if (sort === 'rating') query = query.order('overall_rating', { ascending: false })
  else if (sort === 'newest') query = query.order('created_at', { ascending: false })
  else if (sort === 'cheapest') query = query.order('starting_price_usd', { ascending: true })

  query = query.range(offset, offset + PER_PAGE - 1)

  const { data: tools, count } = await query
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">সব AI টুলস</h1>
        <p className="text-gray-500 dark:text-gray-400">বাংলায় {count || 0}+ AI টুলসের বিস্তারিত রিভিউ ও গাইড</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar filters */}
        <aside className="w-full lg:w-64 shrink-0">
          <ToolFilters categories={categories || []} searchParams={searchParams} />
        </aside>

        {/* Main content */}
        <div className="flex-1">
          {/* Sort bar */}
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200 dark:border-gray-800">
            <span className="text-sm text-gray-500">{count || 0}টি টুলস পাওয়া গেছে</span>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">সাজান:</span>
              <select defaultValue={sort}
                className="text-sm border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-1.5 bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="popular">জনপ্রিয়</option>
                <option value="rating">রেটিং</option>
                <option value="newest">নতুন</option>
                <option value="cheapest">সস্তা</option>
              </select>
            </div>
          </div>

          {tools && tools.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {tools.map((tool: any) => <ToolCard key={tool.id} tool={tool} />)}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center gap-2 mt-10">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <a key={p}
                      href={`?${new URLSearchParams({ ...searchParams, page: p.toString() })}`}
                      className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${parseInt(page) === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-blue-400'}`}
                    >
                      {p}
                    </a>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">কোনো টুলস পাওয়া যায়নি</h3>
              <p className="text-gray-500">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
