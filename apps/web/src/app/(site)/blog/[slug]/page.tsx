import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Clock, Calendar, ChevronRight, AlertCircle } from 'lucide-react'
import ShareButtons from '@/components/blog/ShareButtons'
import TableOfContents from '@/components/blog/TableOfContents'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: post } = await supabase.from('blog_posts').select('title, meta_title, meta_description, thumbnail_url').eq('slug', params.slug).single()
  if (!post) return { title: 'Not Found' }
  return {
    title: post.meta_title || `${post.title} - BanglaAIHub`,
    description: post.meta_description || '',
    openGraph: { images: post.thumbnail_url ? [post.thumbnail_url] : [] },
  }
}

export const revalidate = 3600

export default async function BlogPostPage({ params }: Props) {
  const supabase = createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('*, category:categories(name_bn, slug)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!post) notFound()

  // increment views
  supabase.from('blog_posts').update({ view_count: post.view_count + 1 }).eq('id', post.id)

  // related posts
  const { data: related } = await supabase
    .from('blog_posts')
    .select('id, title, slug, thumbnail_url, published_at, reading_time_minutes')
    .eq('status', 'published')
    .eq('category_id', post.category_id)
    .neq('id', post.id)
    .limit(3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://banglaAIhub.com'
  const postUrl = `${siteUrl}/blog/${post.slug}`

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600">হোম</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/blog" className="hover:text-blue-600">ব্লগ</Link>
        {post.category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/categories/${post.category.slug}`} className="hover:text-blue-600">{post.category.name_bn}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white truncate max-w-xs">{post.title}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main */}
        <article className="flex-1 min-w-0">
          {/* Category */}
          {post.category && (
            <Link href={`/categories/${post.category.slug}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700 mb-4"
            >
              {post.category.name_bn}
            </Link>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white leading-tight mb-4">
            {post.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
            {post.published_at && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.published_at).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.reading_time_minutes} মিনিট পড়তে হবে
            </span>
          </div>

          {/* Thumbnail */}
          {post.thumbnail_url && (
            <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden mb-8">
              <Image src={post.thumbnail_url} alt={post.thumbnail_alt || post.title} width={800} height={450}
                className="w-full h-full object-cover" priority />
            </div>
          )}

          {/* Affiliate Disclosure */}
          {post.affiliate_disclosure && post.has_affiliate_links && (
            <div className="affiliate-disclosure mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>এই পোস্টে affiliate link থাকতে পারে। আপনি এই লিংক ব্যবহার করে কিছু কিনলে আমরা কমিশন পাই — আপনার কোনো অতিরিক্ত খরচ হয় না।</p>
            </div>
          )}

          {/* Content */}
          {post.content_bn && (
            <div
              className="prose-bangla"
              dangerouslySetInnerHTML={{ __html: post.content_bn }}
            />
          )}

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8">
              {post.tags.map((tag: string) => (
                <Link key={tag} href={`/search?tag=${encodeURIComponent(tag)}`}
                  className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:text-blue-600 transition-colors"
                >
                  #{tag}
                </Link>
              ))}
            </div>
          )}

          <ShareButtons url={postUrl} title={post.title} />

          {/* Related posts */}
          {related && related.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">সম্পর্কিত পোস্ট</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {related.map((r: any) => (
                  <Link key={r.id} href={`/blog/${r.slug}`} className="group card-hover overflow-hidden">
                    {r.thumbnail_url && (
                      <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                        <Image src={r.thumbnail_url} alt={r.title} width={300} height={169}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                      </div>
                    )}
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                        {r.title}
                      </h3>
                      <p className="text-xs text-gray-400 mt-1">{r.reading_time_minutes} মিনিট</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-64 shrink-0">
          <div className="sticky top-24">
            <TableOfContents content={post.content_bn || ''} />
          </div>
        </aside>
      </div>
    </div>
  )
}
