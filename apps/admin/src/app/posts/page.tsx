'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, RefreshCw, Search, Edit, Trash2, Eye, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const STATUS_FILTERS = ['all', 'published', 'draft', 'archived', 'failed']
const TYPE_FILTERS = ['all', 'blog', 'tool_review', 'comparison', 'top_list', 'guide', 'money_making']

export default function PostsPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const PER_PAGE = 20
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    let q = supabase.from('blog_posts')
      .select('id, title, slug, status, content_type, published_at, view_count, word_count, source_platform, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range((page - 1) * PER_PAGE, page * PER_PAGE - 1)
    if (status !== 'all') q = q.eq('status', status)
    if (type !== 'all') q = q.eq('content_type', type)
    if (search) q = q.ilike('title', `%${search}%`)
    const { data, count } = await q
    setPosts(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [status, type, page])
  useEffect(() => {
    const t = setTimeout(load, 400)
    return () => clearTimeout(t)
  }, [search])

  const deletePost = async (id: string, title: string) => {
    if (!confirm(`"${title}" ডিলিট করবেন?`)) return
    await supabase.from('blog_posts').delete().eq('id', id)
    toast.success('পোস্ট ডিলিট হয়েছে')
    load()
  }

  const toggleStatus = async (id: string, current: string) => {
    const next = current === 'published' ? 'draft' : 'published'
    await supabase.from('blog_posts').update({
      status: next,
      published_at: next === 'published' ? new Date().toISOString() : null
    }).eq('id', id)
    load()
  }

  const totalPages = Math.ceil(total / PER_PAGE)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Posts Manager</h1>
            <p className="text-sm text-gray-400 mt-0.5">মোট {total}টি পোস্ট</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="admin-btn-secondary"><RefreshCw className="w-4 h-4" /></button>
            <Link href="/quick-submit" className="admin-btn-primary"><Plus className="w-4 h-4" /> নতুন পোস্ট</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="admin-card p-4 flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="admin-input pl-9" placeholder="পোস্ট খুঁজুন..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="admin-input w-auto" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
            {STATUS_FILTERS.map(s => <option key={s} value={s}>{s === 'all' ? 'সব Status' : s}</option>)}
          </select>
          <select className="admin-input w-auto" value={type} onChange={e => { setType(e.target.value); setPage(1) }}>
            {TYPE_FILTERS.map(t => <option key={t} value={t}>{t === 'all' ? 'সব Type' : t}</option>)}
          </select>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">শিরোনাম</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">Type</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">Status</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Views</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">তারিখ</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {posts.map(post => (
                  <tr key={post.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white line-clamp-1">{post.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5 flex items-center gap-2">
                        <span>/{post.slug}</span>
                        {post.source_platform && <span className="px-1.5 py-0.5 bg-gray-800 rounded text-gray-400">{post.source_platform}</span>}
                        {post.word_count > 0 && <span>{post.word_count} শব্দ</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{post.content_type}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleStatus(post.id, post.status)}>
                        <span className={post.status === 'published' ? 'status-badge-published' : post.status === 'draft' ? 'status-badge-draft' : 'status-badge-failed'}>
                          {post.status}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{post.view_count?.toLocaleString()}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {post.published_at ? new Date(post.published_at).toLocaleDateString('bn-BD') : '—'}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`}
                          target="_blank" rel="noopener noreferrer"
                          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                          <Eye className="w-3.5 h-3.5" />
                        </a>
                        <Link href={`/posts/${post.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => deletePost(post.id, post.title)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <div className="text-center py-12 text-gray-500">কোনো পোস্ট পাওয়া যায়নি</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${page === p ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'}`}
              >{p}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
