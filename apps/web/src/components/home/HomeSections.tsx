import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, List, Clock, Tag, Gift } from 'lucide-react'
import type { TopList, BlogPost, Deal } from '@/types'
import NewsletterForm from '@/components/home/NewsletterForm'

// ─── Top Lists ────────────────────────────────────────────────────────────────
export function TopListsSection({ topLists }: { topLists: TopList[] }) {
  const STATIC_LISTS = [
    { title: 'শিক্ষার্থীদের জন্য সেরা AI টুলস', href: '/top-lists/best-ai-for-students', count: 10 },
    { title: 'ফ্রিল্যান্সারদের জন্য সেরা AI টুলস', href: '/top-lists/best-ai-for-freelancing', count: 8 },
    { title: 'সম্পূর্ণ ফ্রি AI টুলস', href: '/top-lists/best-free-ai-tools', count: 20 },
  ]

  const displayLists = topLists.length > 0
    ? topLists.map(l => ({ title: l.title, href: `/top-lists/${l.slug}`, count: l.tool_ids?.length || 0 }))
    : STATIC_LISTS

  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <List className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-blue-500">কিউরেটেড</span>
            </div>
            <h2 className="section-title">টপ AI টুলস লিস্ট</h2>
          </div>
          <Link href="/top-lists" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব লিস্ট <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {displayLists.map((list, i) => (
            <Link key={list.href} href={list.href}
              className="group card-hover p-6 flex items-center gap-4"
            >
              <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors text-sm leading-snug">
                  {list.title}
                </h3>
                <p className="text-xs text-gray-400 mt-1">{list.count}টি টুলস</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Latest Posts ─────────────────────────────────────────────────────────────
export function LatestPosts({ posts }: { posts: BlogPost[] }) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">সর্বশেষ পোস্ট</h2>
            <p className="section-subtitle">AI জগতের সর্বশেষ খবর ও গাইড</p>
          </div>
          <Link href="/blog" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব পোস্ট <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}
              className="group card-hover overflow-hidden flex flex-col"
            >
              {post.thumbnail_url && (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                  <Image src={post.thumbnail_url} alt={post.title} width={400} height={225}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                </div>
              )}
              <div className="p-4 flex flex-col flex-1 gap-2">
                {post.category && (
                  <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                    {post.category.name_bn}
                  </span>
                )}
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {post.title}
                </h3>
                {post.excerpt_bn && (
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {post.excerpt_bn}
                  </p>
                )}
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-auto pt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {post.reading_time_minutes} মিনিট
                  </span>
                  {post.published_at && (
                    <span>{new Date(post.published_at).toLocaleDateString('bn-BD')}</span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Deals Section ────────────────────────────────────────────────────────────
export function DealsSection({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) return null
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Tag className="w-5 h-5 text-red-500" />
              <span className="text-sm font-medium text-red-500">সীমিত সময়</span>
            </div>
            <h2 className="section-title">সেরা AI ডিলস ও অফার</h2>
          </div>
          <Link href="/deals" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব ডিলস <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {deals.map((deal) => (
            <Link key={deal.id} href={deal.affiliate_url || `/deals/${deal.slug}`}
              target={deal.affiliate_url ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="group card-hover p-4 flex flex-col gap-3"
            >
              <div className="flex items-center gap-2">
                {deal.tool?.logo_url && (
                  <Image src={deal.tool.logo_url} alt={deal.tool_name || ''} width={32} height={32} className="rounded-lg" />
                )}
                <div>
                  <div className="font-medium text-sm text-gray-900 dark:text-white">{deal.tool_name}</div>
                  <div className="text-xs text-gray-400">{deal.deal_type === 'lifetime' ? 'লাইফটাইম ডিল' : deal.deal_type === 'coupon' ? 'কুপন' : 'ডিসকাউন্ট'}</div>
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{deal.description_bn}</p>
              {deal.discount_percent && (
                <div className="inline-flex items-center gap-1 px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-bold">
                  {deal.discount_percent}% ছাড়
                </div>
              )}
              {deal.coupon_code && (
                <div className="font-mono text-xs bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-lg text-center text-gray-700 dark:text-gray-300 border border-dashed border-gray-300 dark:border-gray-700">
                  {deal.coupon_code}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Free Resources ───────────────────────────────────────────────────────────
export function FreeResourcesSection() {
  const RESOURCES = [
    { icon: '📝', title: 'ChatGPT প্রম্পট প্যাক', desc: '১০০+ বাংলা prompt', href: '/prompts', badge: 'ফ্রি' },
    { icon: '⚡', title: 'AI Workflow টেমপ্লেট', desc: 'Ready-made workflows', href: '/resources/workflows', badge: 'ফ্রি' },
    { icon: '📋', title: 'AI Learning Roadmap', desc: 'শুরু থেকে expert পর্যন্ত', href: '/resources/roadmap', badge: 'ফ্রি' },
    { icon: '🎯', title: 'ফ্রি AI টুলস লিস্ট', desc: '২০০+ সম্পূর্ণ ফ্রি টুলস', href: '/top-lists/best-free-ai-tools', badge: 'ফ্রি' },
  ]
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Gift className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">সম্পূর্ণ বিনামূল্যে</span>
            </div>
            <h2 className="section-title">ফ্রি রিসোর্স ডাউনলোড করুন</h2>
          </div>
          <Link href="/resources" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব রিসোর্স <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {RESOURCES.map((r) => (
            <Link key={r.href} href={r.href}
              className="group card-hover p-5 flex flex-col gap-3"
            >
              <span className="text-3xl">{r.icon}</span>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</h3>
                  <span className="badge-free">{r.badge}</span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">{r.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-auto">
                নিন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ─── Newsletter ───────────────────────────────────────────────────────────────
export function NewsletterSection() {
  return (
    <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-700">
      <div className="max-w-3xl mx-auto px-4 text-center">
        <div className="text-4xl mb-4">📬</div>
        <h2 className="text-3xl font-bold text-white mb-3">AI Weekly নিউজলেটার</h2>
        <p className="text-blue-100 mb-2">প্রতি সপ্তাহে সেরা AI টুলস, deals ও tips সরাসরি ইমেইলে পাবেন</p>
        <p className="text-blue-200 text-sm mb-8">🎁 সাইন আপ করলে পাবেন: ১০০টি ফ্রি AI টুলসের লিস্ট</p>
        <NewsletterForm />
        <p className="text-blue-200 text-xs mt-4">স্প্যাম নেই। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।</p>
      </div>
    </section>
  )
}

export default TopListsSection
