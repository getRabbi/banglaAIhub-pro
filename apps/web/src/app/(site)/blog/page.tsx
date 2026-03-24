import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, Calendar, ChevronRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ব্লগ - BanglaAIHub',
  description: 'AI tools, guides, tutorials এবং money-making tips বাংলায়।',
}
export const revalidate = 3600

interface Props { searchParams: { page?: string; type?: string } }

const TYPE_LABELS: Record<string, string> = {
  blog: 'ব্লগ', tool_review: 'টুল রিভিউ', comparison: 'তুলনা',
  top_list: 'টপ লিস্ট', guide: 'গাইড', money_making: 'আয় করুন',
}

export default async function BlogPage({ searchParams }: Props) {
  const supabase = createClient()
  const page = parseInt(searchParams.page || '1')
  const type = searchParams.type
  const PER_PAGE = 12
  const offset = (page - 1) * PER_PAGE

  let q = supabase.from('blog_posts')
    .select('id, title, slug, excerpt_bn, thumbnail_url, published_at, reading_time_minutes, content_type, tags, category:categories(name_bn, slug)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + PER_PAGE - 1)

  if (type) q = q.eq('content_type', type)

  const { data: posts, count } = await q
  const totalPages = Math.ceil((count || 0) / PER_PAGE)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ব্লগ ও গাইড</h1>
        <p className="text-gray-500 dark:text-gray-400">AI জগতের সর্বশেষ খবর, গাইড ও টিপস বাংলায়</p>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/blog"
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!type ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
          সব
        </Link>
        {Object.entries(TYPE_LABELS).map(([val, label]) => (
          <Link key={val} href={`/blog?type=${val}`}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${type === val ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            {label}
          </Link>
        ))}
      </div>

      {/* Posts grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {posts?.map((post) => (
          <Link key={post.id} href={`/blog/${post.slug}`} className="group card-hover overflow-hidden flex flex-col">
            {post.thumbnail_url ? (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image src={post.thumbnail_url} alt={post.title} width={400} height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center text-4xl">
                {post.content_type === 'tool_review' ? '🛠️' : post.content_type === 'guide' ? '📖' : post.content_type === 'money_making' ? '💰' : '📝'}
              </div>
            )}
            <div className="p-4 flex flex-col flex-1 gap-2">
              <div className="flex items-center gap-2">
                {post.category && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">{post.category.name_bn}</span>
                )}
                <span className="text-xs text-gray-400 px-2 py-0.5 bg-gray-100 dark:bg-gray-800 rounded-full">
                  {TYPE_LABELS[post.content_type] || post.content_type}
                </span>
              </div>
              <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                {post.title}
              </h2>
              {post.excerpt_bn && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed flex-1">
                  {post.excerpt_bn}
                </p>
              )}
              <div className="flex items-center gap-3 text-xs text-gray-400 pt-2 border-t border-gray-100 dark:border-gray-800">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{post.reading_time_minutes} মিনিট</span>
                {post.published_at && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {new Date(post.published_at).toLocaleDateString('bn-BD')}
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          {page > 1 && (
            <Link href={`/blog?page=${page - 1}${type ? `&type=${type}` : ''}`}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm hover:border-blue-400 transition-colors">
              ← আগে
            </Link>
          )}
          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map(p => (
            <Link key={p} href={`/blog?page=${p}${type ? `&type=${type}` : ''}`}
              className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 hover:border-blue-400'}`}>
              {p}
            </Link>
          ))}
          {page < totalPages && (
            <Link href={`/blog?page=${page + 1}${type ? `&type=${type}` : ''}`}
              className="px-4 py-2 rounded-lg bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 text-sm hover:border-blue-400 transition-colors">
              পরে →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
