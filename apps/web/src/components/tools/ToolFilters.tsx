'use client'
import { useRouter } from 'next/navigation'
import type { Category } from '@/types'

interface Props {
  categories: Category[]
  searchParams: Record<string, string | undefined>
}

export default function ToolFilters({ categories, searchParams }: Props) {
  const router = useRouter()

  const updateFilter = (key: string, value: string | null) => {
    const params = new URLSearchParams()
    Object.entries(searchParams).forEach(([k, v]) => { if (v && k !== key && k !== 'page') params.set(k, v) })
    if (value) params.set(key, value)
    router.push(`/tools?${params.toString()}`)
  }

  return (
    <div className="space-y-6">
      {/* Quick filters */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">দ্রুত ফিল্টার</h3>
        <div className="space-y-1.5">
          {[
            { label: '🔥 ট্রেন্ডিং', value: 'trending' },
            { label: '✨ নতুন', value: 'new' },
            { label: '🆓 ফ্রি', value: 'free' },
            { label: '⭐ এডিটর চয়েস', value: 'editors' },
          ].map((f) => (
            <button key={f.value}
              onClick={() => updateFilter('filter', searchParams.filter === f.value ? null : f.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.filter === f.value ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">মূল্য</h3>
        <div className="space-y-1.5">
          {[
            { label: 'সব', value: null },
            { label: '🆓 ফ্রি', value: 'free' },
            { label: '🔄 ফ্রিমিয়াম', value: 'freemium' },
            { label: '💳 পেইড', value: 'paid' },
            { label: '⚙️ ওপেন সোর্স', value: 'open_source' },
          ].map((p) => (
            <button key={p.label}
              onClick={() => updateFilter('pricing', p.value)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${searchParams.pricing === p.value || (!searchParams.pricing && !p.value) ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Categories */}
      <div className="card p-4">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-3 text-sm">ক্যাটাগরি</h3>
        <div className="space-y-1">
          {categories.map((cat) => (
            <button key={cat.id}
              onClick={() => updateFilter('category', searchParams.category === cat.slug ? null : cat.slug)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center justify-between ${searchParams.category === cat.slug ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
            >
              <span>{cat.icon} {cat.name_bn}</span>
              <span className="text-xs opacity-70">{cat.tool_count}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
