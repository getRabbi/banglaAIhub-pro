import { createClient } from '@/lib/supabase/server'
import ToolCard from '@/components/tools/ToolCard'
import Link from 'next/link'
import Image from 'next/image'
import { Search } from 'lucide-react'
import type { Metadata } from 'next'

interface Props { searchParams: { q?: string; tag?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  return { title: `"${searchParams.q || searchParams.tag}" - সার্চ ফলাফল | BanglaAIHub` }
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams.q?.trim() || ''
  const tag = searchParams.tag?.trim() || ''
  const supabase = createClient()

  // Track search
  if (q) {
    supabase.from('search_analytics').insert({ query: q })
    supabase.from('analytics_events').insert({ event_type: 'search', search_query: q })
  }

  const [toolsResult, postsResult] = await Promise.all([
    q ? supabase.from('tools')
      .select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)')
      .eq('status', 'published')
      .or(`name.ilike.%${q}%,tagline_bn.ilike.%${q}%,description_bn.ilike.%${q}%`)
      .limit(12)
      : { data: [] },
    q ? supabase.from('blog_posts')
      .select('id, title, slug, excerpt_bn, thumbnail_url, published_at, reading_time_minutes, category:categories(name_bn, slug)')
      .eq('status', 'published')
      .or(`title.ilike.%${q}%,excerpt_bn.ilike.%${q}%,content_bn.ilike.%${q}%`)
      .limit(6)
      : tag ? supabase.from('blog_posts')
        .select('id, title, slug, excerpt_bn, thumbnail_url, published_at, reading_time_minutes, category:categories(name_bn, slug)')
        .eq('status', 'published')
        .contains('tags', [tag])
        .limit(12)
      : { data: [] },
  ])

  const tools = toolsResult.data || []
  const posts = postsResult.data || []
  const hasResults = tools.length > 0 || posts.length > 0

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {q ? `"${q}" এর ফলাফল` : tag ? `#${tag} ট্যাগের পোস্ট` : 'সার্চ ফলাফল'}
        </h1>
        {hasResults && (
          <p className="text-gray-500">{tools.length + posts.length}টি ফলাফল পাওয়া গেছে</p>
        )}
      </div>

      {!hasResults && (
        <div className="text-center py-20">
          <Search className="w-16 h-16 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">কোনো ফলাফল পাওয়া যায়নি</h2>
          <p className="text-gray-500 mb-6">অন্য কিছু দিয়ে চেষ্টা করুন অথবা ব্রাউজ করুন</p>
          <div className="flex justify-center gap-3">
            <Link href="/tools" className="btn-primary">সব টুলস</Link>
            <Link href="/blog" className="btn-secondary">সব পোস্ট</Link>
          </div>
        </div>
      )}

      {tools.length > 0 && (
        <section className="mb-12">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">AI টুলস ({tools.length})</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tools.map((tool: any) => <ToolCard key={tool.id} tool={tool} />)}
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">পোস্ট ও গাইড ({posts.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group card-hover overflow-hidden flex flex-col">
                {post.thumbnail_url && (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <Image src={post.thumbnail_url} alt={post.title} width={400} height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  {post.category && (
                    <span className="text-xs text-blue-600 font-medium mb-1">{post.category.name_bn}</span>
                  )}
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">
                    {post.title}
                  </h3>
                  {post.excerpt_bn && (
                    <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt_bn}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-3">{post.reading_time_minutes} মিনিট পড়তে হবে</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
