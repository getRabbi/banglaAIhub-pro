import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ExternalLink, CheckCircle, XCircle, ChevronRight, AlertCircle } from 'lucide-react'
import ToolCard from '@/components/tools/ToolCard'
import ShareButtons from '@/components/blog/ShareButtons'
import type { Metadata } from 'next'

interface Props { params: { slug: string } }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = createClient()
  const { data: tool } = await supabase.from('tools').select('name, tagline_bn, meta_title, meta_description').eq('slug', params.slug).single()
  if (!tool) return { title: 'Tool Not Found' }
  return {
    title: tool.meta_title || `${tool.name} রিভিউ - BanglaAIHub`,
    description: tool.meta_description || tool.tagline_bn || '',
  }
}

export const revalidate = 3600

export default async function ToolDetailPage({ params }: Props) {
  const supabase = createClient()
  const { data: tool } = await supabase
    .from('tools')
    .select('*, category:categories(*), affiliate_link:affiliate_links(*)')
    .eq('slug', params.slug)
    .eq('status', 'published')
    .single()

  if (!tool) notFound()

  // Increment view count
  supabase.from('tools').update({ view_count: tool.view_count + 1 }).eq('id', tool.id)

  // Fetch alternatives
  const { data: altLinks } = await supabase.from('tool_alternatives').select('alternative_tool_id').eq('tool_id', tool.id)
  const altIds = altLinks?.map(a => a.alternative_tool_id) || []
  const { data: alternatives } = altIds.length > 0
    ? await supabase.from('tools').select('*, category:categories(name_bn, slug, icon), affiliate_link:affiliate_links(slug)').in('id', altIds).eq('status', 'published').limit(3)
    : { data: [] }

  // Fetch related posts
  const { data: relatedPosts } = await supabase
    .from('blog_posts').select('id, title, slug, thumbnail_url, published_at, reading_time_minutes')
    .contains('related_tool_ids', [tool.id]).eq('status', 'published').limit(3)

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://banglaAIhub.com'
  const toolUrl = `${siteUrl}/tools/${tool.slug}`

  const affiliateUrl = tool.affiliate_link ? `/go/${tool.affiliate_link.slug}` : tool.website_url

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
        <Link href="/" className="hover:text-blue-600">হোম</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/tools" className="hover:text-blue-600">AI টুলস</Link>
        {tool.category && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link href={`/categories/${tool.category.slug}`} className="hover:text-blue-600">{tool.category.name_bn}</Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-gray-900 dark:text-white">{tool.name}</span>
      </nav>

      <div className="flex flex-col lg:flex-row gap-10">
        {/* Main Content */}
        <article className="flex-1 min-w-0">
          {/* Tool Header */}
          <div className="flex items-start gap-5 mb-8">
            <div className="w-20 h-20 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
              {tool.logo_url ? (
                <Image src={tool.logo_url} alt={tool.name} width={80} height={80} className="object-cover" />
              ) : (
                <span className="text-4xl">🤖</span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{tool.name}</h1>
                {tool.is_editors_choice && <span className="badge-editors">⭐ এডিটর চয়েস</span>}
                {tool.is_new && <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 rounded-full">নতুন</span>}
                {tool.is_trending && <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 rounded-full">🔥 ট্রেন্ডিং</span>}
              </div>
              {tool.tagline_bn && (
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-3">{tool.tagline_bn}</p>
              )}
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1">
                  {[1,2,3,4,5].map((i) => (
                    <Star key={i} className={`w-5 h-5 ${i <= Math.round(tool.overall_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`} />
                  ))}
                  <span className="ml-1 font-semibold">{tool.overall_rating.toFixed(1)}</span>
                </div>
                <span className={tool.pricing_type === 'free' ? 'badge-free' : tool.pricing_type === 'freemium' ? 'badge-freemium' : 'badge-paid'}>
                  {tool.pricing_type === 'free' ? 'ফ্রি' : tool.pricing_type === 'freemium' ? 'ফ্রিমিয়াম' : 'পেইড'}
                </span>
                {tool.category && (
                  <Link href={`/categories/${tool.category.slug}`}
                    className="text-sm text-blue-600 hover:text-blue-700"
                  >
                    {tool.category.icon} {tool.category.name_bn}
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Affiliate Disclosure */}
          {tool.affiliate_link && (
            <div className="affiliate-disclosure mb-6">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>এই পেজে affiliate link থাকতে পারে। আপনি এই লিংক ব্যবহার করে কিছু কিনলে আমরা কমিশন পাই — আপনার কোনো অতিরিক্ত খরচ হয় না।</p>
            </div>
          )}

          {/* Description */}
          {tool.description_bn && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{tool.name} কী?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed text-base">{tool.description_bn}</p>
            </section>
          )}

          {/* Key Features */}
          {tool.key_features?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">প্রধান ফিচারসমূহ</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tool.key_features.map((feature: string, i: number) => (
                  <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Pros & Cons */}
          {(tool.pros?.length > 0 || tool.cons?.length > 0) && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">সুবিধা ও অসুবিধা</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-xl">
                  <h3 className="font-semibold text-green-700 dark:text-green-400 mb-3">✅ সুবিধা</h3>
                  <ul className="space-y-2">
                    {tool.pros.map((pro: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                        {pro}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                  <h3 className="font-semibold text-red-700 dark:text-red-400 mb-3">❌ অসুবিধা</h3>
                  <ul className="space-y-2">
                    {tool.cons.map((con: string, i: number) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <XCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                        {con}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {/* Who Should Use */}
          {tool.who_should_use_bn && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">কার জন্য উপযুক্ত?</h2>
              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">{tool.who_should_use_bn}</p>
            </section>
          )}

          {/* Expert Verdict */}
          {tool.expert_verdict_bn && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">বিশেষজ্ঞ মতামত</h2>
              <div className="p-5 bg-blue-50 dark:bg-blue-900/10 border-l-4 border-blue-600 rounded-r-xl">
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed italic">"{tool.expert_verdict_bn}"</p>
                <p className="text-sm text-blue-600 font-medium mt-2">— BanglaAIHub টিম</p>
              </div>
            </section>
          )}

          {/* FAQ */}
          {tool.faq?.length > 0 && (
            <section className="mb-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">সাধারণ প্রশ্ন (FAQ)</h2>
              <div className="space-y-4">
                {tool.faq.map((item: { question: string; answer: string }, i: number) => (
                  <details key={i} className="group card p-4">
                    <summary className="flex items-center justify-between cursor-pointer font-medium text-gray-900 dark:text-white list-none">
                      {item.question}
                      <ChevronRight className="w-4 h-4 text-gray-400 group-open:rotate-90 transition-transform" />
                    </summary>
                    <p className="mt-3 text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.answer}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {/* Share */}
          <ShareButtons url={toolUrl} title={`${tool.name} - BanglaAIHub`} />

          {/* Alternatives */}
          {alternatives && alternatives.length > 0 && (
            <section className="mt-10">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{tool.name}-এর বিকল্প</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {alternatives.map((alt: any) => <ToolCard key={alt.id} tool={alt} compact />)}
              </div>
            </section>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 space-y-4">
            {/* Summary Box */}
            <div className="card p-5">
              <h3 className="font-bold text-gray-900 dark:text-white mb-4 pb-3 border-b border-gray-200 dark:border-gray-700">
                {tool.name} সংক্ষেপ
              </h3>
              <dl className="space-y-3 text-sm">
                {[
                  { label: 'সেরা যাদের জন্য', value: tool.best_for?.join(', ') || '—' },
                  { label: 'শুরুর মূল্য', value: tool.pricing_type === 'free' ? 'সম্পূর্ণ ফ্রি' : tool.starting_price_usd ? `$${tool.starting_price_usd}/মাস` : '—' },
                  { label: 'ফ্রি প্ল্যান', value: tool.has_free_plan ? '✅ আছে' : '❌ নেই' },
                  { label: 'প্ল্যাটফর্ম', value: tool.platforms?.join(', ') || '—' },
                  { label: 'ক্যাটাগরি', value: tool.category?.name_bn || '—' },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between gap-2">
                    <dt className="text-gray-500 dark:text-gray-400">{label}</dt>
                    <dd className="font-medium text-gray-900 dark:text-white text-right">{value}</dd>
                  </div>
                ))}
              </dl>

              {/* Rating breakdown */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 space-y-2">
                {[
                  { label: 'সামগ্রিক', value: tool.overall_rating },
                  { label: 'ব্যবহার সহজ', value: tool.ease_of_use_rating },
                  { label: 'মান', value: tool.value_rating },
                  { label: 'ফিচার', value: tool.feature_rating },
                ].map(({ label, value }) => (
                  <div key={label} className="flex items-center gap-2 text-sm">
                    <span className="w-24 text-gray-500 dark:text-gray-400 shrink-0">{label}</span>
                    <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                      <div className="bg-amber-400 h-1.5 rounded-full" style={{ width: `${(value / 5) * 100}%` }} />
                    </div>
                    <span className="font-medium w-8 text-right">{value.toFixed(1)}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              {affiliateUrl && (
                <a href={affiliateUrl}
                  target={tool.affiliate_link ? '_blank' : undefined}
                  rel="noopener noreferrer"
                  className="btn-accent w-full justify-center mt-5 py-3 text-base"
                >
                  {tool.name} ব্যবহার করুন <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {tool.website_url && (
                <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
                  className="btn-outline w-full justify-center mt-2 text-sm"
                >
                  অফিসিয়াল সাইট
                </a>
              )}
            </div>

            {/* Related posts */}
            {relatedPosts && relatedPosts.length > 0 && (
              <div className="card p-4">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">সম্পর্কিত পোস্ট</h3>
                <div className="space-y-3">
                  {relatedPosts.map((post: any) => (
                    <Link key={post.id} href={`/blog/${post.slug}`}
                      className="flex gap-3 group"
                    >
                      {post.thumbnail_url && (
                        <Image src={post.thumbnail_url} alt={post.title} width={56} height={56}
                          className="w-14 h-14 rounded-lg object-cover shrink-0" />
                      )}
                      <div>
                        <h4 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                          {post.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-1">{post.reading_time_minutes} মিনিট</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  )
}
