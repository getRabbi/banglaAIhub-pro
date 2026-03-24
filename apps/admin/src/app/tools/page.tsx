'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Plus, Edit, Trash2, Search, Star, RefreshCw } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function AdminToolsPage() {
  const [tools, setTools] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [total, setTotal] = useState(0)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    let q = supabase.from('tools')
      .select('id, name, slug, pricing_type, overall_rating, is_trending, is_new, is_editors_choice, status, category:categories(name_bn), view_count, affiliate_click_count, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(50)
    if (search) q = q.ilike('name', `%${search}%`)
    const { data, count } = await q
    setTools(data || [])
    setTotal(count || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])
  useEffect(() => { const t = setTimeout(load, 400); return () => clearTimeout(t) }, [search])

  const deleteTool = async (id: string, name: string) => {
    if (!confirm(`"${name}" ডিলিট করবেন?`)) return
    await supabase.from('tools').delete().eq('id', id)
    toast.success('টুল ডিলিট হয়েছে')
    load()
  }

  const toggleBadge = async (id: string, field: string, current: boolean) => {
    await supabase.from('tools').update({ [field]: !current }).eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white">Tools Manager</h1>
            <p className="text-sm text-gray-400 mt-0.5">মোট {total}টি টুলস</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="admin-btn-secondary"><RefreshCw className="w-4 h-4" /></button>
            <Link href="/tools/import" className="admin-btn-secondary text-xs">CSV Import</Link>
            <Link href="/tools/new" className="admin-btn-primary"><Plus className="w-4 h-4" /> নতুন টুল</Link>
          </div>
        </div>

        <div className="admin-card p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input className="admin-input pl-9" placeholder="টুল খুঁজুন..." value={search}
              onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">টুল</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">ক্যাটাগরি</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">মূল্য</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20">Rating</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">Badge</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Clicks</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tools.map(tool => (
                  <tr key={tool.id} className="hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{tool.name}</div>
                      <div className="text-xs text-gray-500">/{tool.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{tool.category?.name_bn || '—'}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium
                        ${tool.pricing_type === 'free' ? 'bg-green-900/30 text-green-400' :
                          tool.pricing_type === 'freemium' ? 'bg-blue-900/30 text-blue-400' :
                          'bg-orange-900/30 text-orange-400'}`}>
                        {tool.pricing_type}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span className="text-sm text-white">{tool.overall_rating?.toFixed(1)}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1 flex-wrap">
                        <button onClick={() => toggleBadge(tool.id, 'is_trending', tool.is_trending)}
                          className={`text-xs px-1.5 py-0.5 rounded ${tool.is_trending ? 'bg-orange-900/50 text-orange-400' : 'bg-gray-800 text-gray-600'}`}>
                          🔥
                        </button>
                        <button onClick={() => toggleBadge(tool.id, 'is_new', tool.is_new)}
                          className={`text-xs px-1.5 py-0.5 rounded ${tool.is_new ? 'bg-red-900/50 text-red-400' : 'bg-gray-800 text-gray-600'}`}>
                          New
                        </button>
                        <button onClick={() => toggleBadge(tool.id, 'is_editors_choice', tool.is_editors_choice)}
                          className={`text-xs px-1.5 py-0.5 rounded ${tool.is_editors_choice ? 'bg-purple-900/50 text-purple-400' : 'bg-gray-800 text-gray-600'}`}>
                          ⭐
                        </button>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      <div>{tool.view_count} views</div>
                      <div className="text-green-400">{tool.affiliate_click_count} affiliate</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/tools/${tool.id}/edit`}
                          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                          <Edit className="w-3.5 h-3.5" />
                        </Link>
                        <button onClick={() => deleteTool(tool.id, tool.name)}
                          className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {tools.length === 0 && <div className="text-center py-12 text-gray-500">কোনো টুলস নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
