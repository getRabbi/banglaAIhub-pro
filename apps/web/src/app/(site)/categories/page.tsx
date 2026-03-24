import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI টুলস ক্যাটাগরি - BanglaAIHub',
  description: 'AI Writing, Video, Image, Coding, Marketing সহ সব ক্যাটাগরির টুলস বাংলায়।',
}
export const revalidate = 3600

export default async function CategoriesPage() {
  const supabase = createClient()
  const { data: categories } = await supabase.from('categories').select('*').order('sort_order')

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">সব ক্যাটাগরি</h1>
        <p className="text-gray-500 dark:text-gray-400">আপনার কাজ অনুযায়ী সেরা AI টুলস খুঁজুন</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories?.map((cat) => (
          <Link key={cat.id} href={`/categories/${cat.slug}`}
            className="group card-hover p-6 flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 transition-transform group-hover:scale-110"
              style={{ backgroundColor: `${cat.color}15` }}>
              {cat.icon}
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1">
                {cat.name_bn}
              </h2>
              {cat.description_bn && (
                <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-2">{cat.description_bn}</p>
              )}
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">{cat.tool_count}টি টুলস</span>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
