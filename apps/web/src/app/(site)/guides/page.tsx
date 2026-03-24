// Guides hub page
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, BookOpen } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI গাইড - BanglaAIHub',
  description: 'ChatGPT, Midjourney সহ সব AI টুলসের বাংলা গাইড ও টিউটোরিয়াল।',
}
export const revalidate = 3600

export default async function GuidesPage() {
  const supabase = createClient()
  const { data: guides } = await supabase.from('blog_posts')
    .select('id, title, slug, excerpt_bn, thumbnail_url, published_at, reading_time_minutes, tags')
    .eq('status', 'published').eq('content_type', 'guide')
    .order('published_at', { ascending: false }).limit(20)

  const STATIC_GUIDES = [
    { title: 'ChatGPT সঠিকভাবে ব্যবহার করুন — বাংলা গাইড', slug: 'how-to-use-chatgpt', reading_time_minutes: 8, tags: ['chatgpt', 'beginner'] },
    { title: 'AI দিয়ে ফ্রিল্যান্সিং শুরু করুন', slug: 'ai-freelancing-guide', reading_time_minutes: 12, tags: ['freelancing', 'ai'] },
    { title: 'সঠিক AI টুল কীভাবে বেছে নেবেন', slug: 'how-to-choose-ai-tool', reading_time_minutes: 6, tags: ['tips'] },
    { title: 'AI দিয়ে ব্যবসা অটোমেট করুন', slug: 'ai-business-automation', reading_time_minutes: 10, tags: ['business', 'automation'] },
  ]

  const display = guides && guides.length > 0 ? guides : STATIC_GUIDES

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <BookOpen className="w-5 h-5 text-blue-500" />
          <span className="text-sm font-medium text-blue-500">শিক্ষামূলক</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI গাইড ও টিউটোরিয়াল</h1>
        <p className="text-gray-500 dark:text-gray-400">শুরু থেকে expert পর্যন্ত — সব AI গাইড বাংলায়</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {display.map((guide: any) => (
          <Link key={guide.slug} href={`/guides/${guide.slug}`} className="group card-hover overflow-hidden flex flex-col">
            {guide.thumbnail_url ? (
              <div className="aspect-video bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <Image src={guide.thumbnail_url} alt={guide.title} width={400} height={225}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
            ) : (
              <div className="aspect-video bg-gradient-to-br from-blue-600/20 to-cyan-600/20 flex items-center justify-center text-5xl">📖</div>
            )}
            <div className="p-4 flex flex-col flex-1">
              <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors line-clamp-2 mb-2">{guide.title}</h2>
              {guide.excerpt_bn && <p className="text-sm text-gray-500 line-clamp-2 flex-1">{guide.excerpt_bn}</p>}
              <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs text-gray-400">{guide.reading_time_minutes} মিনিট পড়তে হবে</span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
