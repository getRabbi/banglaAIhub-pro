'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import Link from 'next/link'

const DAYS = ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহ', 'শুক্র', 'শনি']
const MONTHS_BN = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর']

const TYPE_COLOR: Record<string, string> = {
  blog: 'bg-blue-600', tool_review: 'bg-purple-600', comparison: 'bg-yellow-600',
  top_list: 'bg-green-600', guide: 'bg-cyan-600', money_making: 'bg-emerald-600',
}

export default function CalendarPage() {
  const [today] = useState(new Date())
  const [current, setCurrent] = useState(new Date())
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const year = current.getFullYear()
  const month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      const from = new Date(year, month, 1).toISOString()
      const to = new Date(year, month + 1, 0, 23, 59, 59).toISOString()
      const { data } = await supabase.from('blog_posts')
        .select('id, title, slug, status, content_type, published_at, scheduled_at')
        .or(`published_at.gte.${from},scheduled_at.gte.${from}`)
        .or(`published_at.lte.${to},scheduled_at.lte.${to}`)
        .order('published_at', { ascending: true })
      setPosts(data || [])
      setLoading(false)
    }
    load()
  }, [year, month])

  const getPostsForDay = (day: number) => {
    const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return posts.filter(p => {
      const d = (p.published_at || p.scheduled_at || '').substring(0, 10)
      return d === date
    })
  }

  const prev = () => setCurrent(new Date(year, month - 1, 1))
  const next = () => setCurrent(new Date(year, month + 1, 1))

  const cells = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let i = 1; i <= daysInMonth; i++) cells.push(i)

  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
  const currentStr = (d: number) => `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Content Calendar</h1>
          <div className="flex items-center gap-3">
            <button onClick={prev} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
            <span className="text-white font-semibold min-w-36 text-center">{MONTHS_BN[month]} {year}</span>
            <button onClick={next} className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3">
          {Object.entries(TYPE_COLOR).map(([type, color]) => (
            <div key={type} className="flex items-center gap-1.5 text-xs text-gray-400">
              <div className={`w-2.5 h-2.5 rounded-full ${color}`} />
              {type === 'blog' ? 'ব্লগ' : type === 'tool_review' ? 'টুল রিভিউ' : type === 'comparison' ? 'তুলনা' : type === 'top_list' ? 'টপ লিস্ট' : type === 'guide' ? 'গাইড' : 'আয়'}
            </div>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            {/* Day headers */}
            <div className="grid grid-cols-7 border-b border-gray-800">
              {DAYS.map(d => (
                <div key={d} className="py-3 text-center text-xs font-semibold text-gray-500">{d}</div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 divide-x divide-gray-800">
              {cells.map((day, i) => {
                if (!day) return <div key={`empty-${i}`} className="min-h-24 bg-gray-900/30" />
                const dayPosts = getPostsForDay(day)
                const isToday = currentStr(day) === todayStr
                return (
                  <div key={day} className={`min-h-24 p-1.5 border-b border-gray-800 ${isToday ? 'bg-blue-950/30' : 'hover:bg-gray-800/30'} transition-colors`}>
                    <div className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>
                      {day}
                    </div>
                    <div className="space-y-0.5">
                      {dayPosts.slice(0, 3).map(post => (
                        <Link key={post.id} href={`/posts/${post.id}/edit`}
                          className={`block px-1.5 py-0.5 rounded text-xs text-white truncate ${TYPE_COLOR[post.content_type] || 'bg-gray-600'} ${post.status === 'draft' || post.scheduled_at ? 'opacity-60' : ''}`}
                          title={post.title}
                        >
                          {post.title.substring(0, 20)}...
                        </Link>
                      ))}
                      {dayPosts.length > 3 && (
                        <div className="text-xs text-gray-500 px-1">+{dayPosts.length - 3} আরো</div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-white">{posts.filter(p => p.status === 'published').length}</div>
            <div className="text-xs text-gray-500 mt-1">এই মাসে Published</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{posts.filter(p => p.scheduled_at && p.status === 'draft').length}</div>
            <div className="text-xs text-gray-500 mt-1">Scheduled</div>
          </div>
          <div className="admin-card p-4 text-center">
            <div className="text-2xl font-bold text-gray-400">{posts.filter(p => p.status === 'draft').length}</div>
            <div className="text-xs text-gray-500 mt-1">Draft</div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
