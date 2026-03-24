'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Plus, Trash2, Edit, List } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function TopListsAdminPage() {
  const [lists, setLists] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('top_lists').select('id, title, slug, status, view_count, tool_ids, created_at').order('created_at', { ascending: false })
    setLists(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const toggle = async (id: string, status: string) => {
    await supabase.from('top_lists').update({ status: status === 'published' ? 'draft' : 'published', published_at: status !== 'published' ? new Date().toISOString() : null }).eq('id', id)
    load()
  }

  const del = async (id: string) => {
    if (!confirm('ডিলিট করবেন?')) return
    await supabase.from('top_lists').delete().eq('id', id)
    toast.success('ডিলিট হয়েছে'); load()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <List className="w-5 h-5 text-blue-400" /> Top Lists
          </h1>
          <Link href="/top-lists/new" className="admin-btn-primary"><Plus className="w-4 h-4" /> নতুন লিস্ট</Link>
        </div>
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">শিরোনাম</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20 text-center">টুলস</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Status</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Views</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {lists.map(l => (
                  <tr key={l.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{l.title}</div>
                      <div className="text-xs text-gray-500">/{l.slug}</div>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-400">{l.tool_ids?.length || 0}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggle(l.id, l.status)}>
                        <span className={l.status === 'published' ? 'status-badge-published' : 'status-badge-draft'}>{l.status}</span>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-gray-400">{l.view_count}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link href={`/top-lists/${l.id}/edit`} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></Link>
                        <button onClick={() => del(l.id)} className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {lists.length === 0 && <div className="text-center py-12 text-gray-500">কোনো top list নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
