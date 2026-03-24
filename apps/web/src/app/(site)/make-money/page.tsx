import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { DollarSign, ArrowRight, Clock } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI দিয়ে আয় করুন - BanglaAIHub',
  description: 'AI দিয়ে ফ্রিল্যান্সিং, YouTube, affiliate marketing ও passive income করার বাংলা গাইড।',
}
export const revalidate = 3600

const CATEGORIES = [
  { icon: '💼', label: 'ফ্রিল্যান্সিং', slug: 'freelancing', desc: 'AI দিয়ে Fiverr ও Upwork-এ কাজ করুন' },
  { icon: '📺', label: 'YouTube', slug: 'youtube', desc: 'AI দিয়ে YouTube channel চালান' },
  { icon: '🔗', label: 'Affiliate', slug: 'affiliate', desc: 'AI টুলস প্রমোট করে কমিশন আয়' },
  { icon: '⚡', label: 'Passive Income', slug: 'passive-income', desc: 'AI দিয়ে স্বয়ংক্রিয় আয়' },
  { icon: '🤖', label: 'Automation', slug: 'automation', desc: 'AI দিয়ে ব্যবসা অটোমেট করুন' },
  { icon: '✍️', label: 'Content', slug: 'content', desc: 'AI দিয়ে content তৈরি করে আয়' },
]

export default async function MakeMoneyPage() {
  const supabase = createClient()
  const { data: posts } = await supabase.from('blog_posts')
    .select('id, title, slug, excerpt_bn, thumbnail_url, reading_time_minutes, tags')
    .eq('status', 'published').eq('content_type', 'money_making')
    .order('published_at', { ascending: false }).limit(9)

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-10">
        <div className="flex items-center gap-2 mb-2">
          <DollarSign className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-500">আয় করুন</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI দিয়ে অনলাইনে আয়</h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">বাস্তব কৌশল যা দিয়ে মানুষ ইতোমধ্যে AI ব্যবহার করে আয় করছে</p>
      </div>

      {/* Category cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-12">
        {CATEGORIES.map(cat => (
          <Link key={cat.slug} href={`/make-money/${cat.slug}`}
            className="group card-hover p-4 text-center flex flex-col items-center gap-2">
            <span className="text-3xl">{cat.icon}</span>
            <div>
              <div className="font-semibold text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{cat.label}</div>
              <div className="text-xs text-gray-400 mt-0.5 leading-tight">{cat.desc}</div>
            </div>
          </Link>
        ))}
      </div>

      {/* Posts */}
      {posts && posts.length > 0 && (
        <>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">সর্বশেষ আর্টিকেল</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((post: any) => (
              <Link key={post.id} href={`/make-money/${post.slug}`} className="group card-hover overflow-hidden flex flex-col">
                {post.thumbnail_url ? (
                  <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                    <Image src={post.thumbnail_url} alt={post.title} width={400} height={225}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  </div>
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-green-600/20 to-blue-600/20 flex items-center justify-center text-5xl">💰</div>
                )}
                <div className="p-4 flex flex-col flex-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{post.title}</h3>
                  {post.excerpt_bn && <p className="text-sm text-gray-500 line-clamp-2 flex-1">{post.excerpt_bn}</p>}
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-3">
                    <Clock className="w-3.5 h-3.5" /> {post.reading_time_minutes} মিনিট
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
