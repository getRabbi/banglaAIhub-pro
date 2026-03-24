'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, Sparkles, ArrowRight } from 'lucide-react'
import Link from 'next/link'

const QUICK_SEARCHES = ['ChatGPT', 'Midjourney', 'AI ভিডিও', 'ফ্রি AI টুলস', 'Coding AI']

const STATS = [
  { value: '৫০০+', label: 'AI টুলস' },
  { value: '১৫+', label: 'ক্যাটাগরি' },
  { value: '১০০%', label: 'বাংলায়' },
  { value: 'ফ্রি', label: 'সবসময়' },
]

export default function HeroSection() {
  const [query, setQuery] = useState('')
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white dark:from-gray-900 dark:via-gray-950 dark:to-gray-950 pt-16 pb-20">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-blue-400/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-72 h-72 bg-purple-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm font-medium mb-6">
          <Sparkles className="w-4 h-4" />
          বাংলায় সবচেয়ে বড় AI টুলস ডিরেক্টরি
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6">
          সেরা <span className="text-gradient">AI টুলস</span> খুঁজুন<br />
          বাংলায়, সহজে
        </h1>

        <p className="text-lg md:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10">
          ৫০০+ AI টুলের রিভিউ, তুলনা, গাইড এবং কীভাবে আয় করবেন — সবকিছু বাংলায়
        </p>

        {/* Search */}
        <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-6">
          <div className="relative flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="কোন AI টুল খুঁজছেন?"
                className="w-full pl-12 pr-4 py-4 text-base bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button type="submit" className="btn-primary px-6 py-4 text-base rounded-xl">
              খুঁজুন
            </button>
          </div>
        </form>

        {/* Quick searches */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          <span className="text-sm text-gray-500 dark:text-gray-400 py-1">জনপ্রিয়:</span>
          {QUICK_SEARCHES.map((q) => (
            <button key={q}
              onClick={() => router.push(`/search?q=${encodeURIComponent(q)}`)}
              className="px-3 py-1 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full hover:border-blue-400 hover:text-blue-600 transition-colors"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto mb-12">
          {STATS.map((s) => (
            <div key={s.label} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-4">
              <div className="text-2xl font-bold text-blue-600">{s.value}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">{s.label}</div>
            </div>
          ))}
        </div>

        {/* CTAs */}
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/tools" className="btn-primary">
            সব AI টুলস দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/find-tool" className="btn-secondary">
            <Sparkles className="w-4 h-4" />
            আমার জন্য টুল খুঁজুন
          </Link>
        </div>
      </div>
    </section>
  )
}
