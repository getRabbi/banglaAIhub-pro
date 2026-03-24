import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import type { Category } from '@/types'

interface Props { categories: Category[] }

export default function CategoryGrid({ categories }: Props) {
  return (
    <section className="py-16 bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="section-title">ক্যাটাগরি অনুযায়ী খুঁজুন</h2>
            <p className="section-subtitle">আপনার কাজ অনুযায়ী সেরা AI টুলস বেছে নিন</p>
          </div>
          <Link href="/categories" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব ক্যাটাগরি <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/categories/${cat.slug}`}
              className="group card-hover p-4 text-center flex flex-col items-center gap-2"
            >
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform group-hover:scale-110"
                style={{ backgroundColor: `${cat.color}15` }}
              >
                {cat.icon}
              </div>
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {cat.name_bn}
                </div>
                <div className="text-xs text-gray-400 mt-0.5">{cat.tool_count}টি টুলস</div>
              </div>
            </Link>
          ))}

          {/* View all card */}
          <Link href="/categories"
            className="group card p-4 text-center flex flex-col items-center justify-center gap-2 border-dashed hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10 transition-all"
          >
            <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors">
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <span className="text-sm font-medium text-gray-500 group-hover:text-blue-600 transition-colors">সব ক্যাটাগরি</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
