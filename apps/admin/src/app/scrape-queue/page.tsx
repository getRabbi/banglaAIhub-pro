'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { Check, X, Loader2, ExternalLink, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

export default function ScrapeQueuePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [filter, setFilter] = useState('pending')

  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('scrape_queue')
      .select('*')
      .eq('status', filter)
      .order('scraped_at', { ascending: false })
      .limit(50)
    setItems(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const approve = async (item: any) => {
    setProcessingId(item.id)
    try {
      const res = await fetch('/api/scrape-queue/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: item.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Approved — blog তৈরি হচ্ছে!')
      load()
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setProcessingId(null)
    }
  }

  const reject = async (id: string, reason = 'Admin rejected') => {
    await supabase.from('scrape_queue').update({ status: 'rejected', rejection_reason: reason }).eq('id', id)
    toast.success('Rejected')
    load()
  }

  const FILTERS = [
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Published', value: 'published' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Failed', value: 'failed' },
  ]

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Scrape Queue</h1>
            <p className="text-sm text-gray-400 mt-0.5">OpenClaw-এর collected topics approve/reject করুন</p>
          </div>
          <button onClick={load} className="admin-btn-secondary">
            <RefreshCw className="w-4 h-4" /> Refresh
          </button>
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.value ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Items */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 text-gray-500">কোনো item নেই</div>
        ) : (
          <div className="space-y-3">
            {items.map(item => (
              <div key={item.id} className="admin-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${item.source_platform === 'reddit' ? 'bg-orange-900/30 text-orange-400' :
                          item.source_platform === 'hackernews' ? 'bg-yellow-900/30 text-yellow-400' :
                          item.source_platform === 'producthunt' ? 'bg-red-900/30 text-red-400' :
                          'bg-blue-900/30 text-blue-400'}`}
                      >
                        {item.source_platform}
                      </span>
                      <span className="text-xs text-gray-500">Score: {item.relevance_score}</span>
                      {item.is_duplicate && (
                        <span className="text-xs bg-yellow-900/30 text-yellow-400 px-2 py-0.5 rounded-full">Duplicate</span>
                      )}
                    </div>
                    <h3 className="font-medium text-white text-sm leading-snug mb-1">{item.source_title}</h3>
                    {item.source_content && (
                      <p className="text-xs text-gray-500 line-clamp-2">{item.source_content}</p>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      {item.source_url && (
                        <a href={item.source_url} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          সোর্স দেখুন <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                      <span className="text-xs text-gray-600">
                        {new Date(item.scraped_at).toLocaleString('bn-BD')}
                      </span>
                    </div>
                    {item.rejection_reason && (
                      <p className="text-xs text-red-400 mt-1">কারণ: {item.rejection_reason}</p>
                    )}
                  </div>

                  {filter === 'pending' && (
                    <div className="flex gap-2 shrink-0">
                      <button onClick={() => approve(item)}
                        disabled={processingId === item.id || item.is_duplicate}
                        className="admin-btn-success disabled:opacity-50 py-1.5 px-3 text-xs"
                      >
                        {processingId === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Approve
                      </button>
                      <button onClick={() => reject(item.id)}
                        className="admin-btn-danger py-1.5 px-3 text-xs"
                      >
                        <X className="w-3.5 h-3.5" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
