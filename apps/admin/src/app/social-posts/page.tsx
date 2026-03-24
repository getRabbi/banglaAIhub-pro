'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, RefreshCw, ExternalLink, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SocialPostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [retrying, setRetrying] = useState<string | null>(null)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    let q = supabase.from('social_posts')
      .select('*, blog_post:blog_posts(title, slug)')
      .order('created_at', { ascending: false })
      .limit(50)
    if (filter !== 'all') q = q.eq('status', filter)
    const { data } = await q
    setPosts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [filter])

  const retry = async (post: any) => {
    setRetrying(post.id)
    try {
      const res = await fetch('/api/social/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ social_post_id: post.id }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Retry সফল!')
      load()
    } catch (e: any) { toast.error(e.message) }
    setRetrying(null)
  }

  const FILTERS = ['all', 'pending', 'posted', 'failed', 'scheduled']
  const statusColor: Record<string, string> = {
    posted: 'status-badge-published',
    pending: 'status-badge-pending',
    failed: 'status-badge-failed',
    scheduled: 'status-badge-draft',
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Social Posts</h1>
          <button onClick={load} className="admin-btn-secondary"><RefreshCw className="w-4 h-4" /></button>
        </div>

        <div className="flex gap-2 flex-wrap">
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}>
              {f}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="space-y-3">
            {posts.map(post => (
              <div key={post.id} className="admin-card p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={statusColor[post.status] || 'status-badge-pending'}>{post.status}</span>
                      <span className="text-xs text-gray-500">{post.platform}</span>
                      {post.retry_count > 0 && <span className="text-xs text-yellow-400">Retry: {post.retry_count}x</span>}
                    </div>
                    {post.blog_post && (
                      <div className="text-sm font-medium text-white mb-2">{post.blog_post.title}</div>
                    )}
                    <p className="text-xs text-gray-400 line-clamp-3 leading-relaxed">{post.hook_text}</p>
                    <div className="flex gap-3 mt-2 text-xs text-gray-600">
                      {post.posted_at && <span>Posted: {new Date(post.posted_at).toLocaleString('bn-BD')}</span>}
                      {post.comment_posted_at && <span className="text-green-600">✓ Comment done</span>}
                      {post.error_message && <span className="text-red-400">{post.error_message}</span>}
                    </div>
                    {post.facebook_post_id && (
                      <a href={`https://facebook.com/${post.facebook_post_id}`} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 mt-1">
                        FB Post দেখুন <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {post.status === 'failed' && post.retry_count < 3 && (
                    <button onClick={() => retry(post)} disabled={retrying === post.id}
                      className="admin-btn-secondary text-xs py-1.5 shrink-0">
                      {retrying === post.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      Retry
                    </button>
                  )}
                </div>
              </div>
            ))}
            {posts.length === 0 && <div className="text-center py-12 text-gray-500">কোনো post নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
