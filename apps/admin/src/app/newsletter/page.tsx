'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Users, Mail, Download, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

export default function NewsletterPage() {
  const [subscribers, setSubscribers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [total, setTotal] = useState(0)
  const [activeCount, setActiveCount] = useState(0)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data, count } = await supabase.from('newsletter_subscribers')
      .select('*', { count: 'exact' })
      .order('subscribed_at', { ascending: false })
      .limit(50)
    const { count: active } = await supabase.from('newsletter_subscribers')
      .select('*', { count: 'exact', head: true }).eq('is_active', true)
    setSubscribers(data || [])
    setTotal(count || 0)
    setActiveCount(active || 0)
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const exportCSV = () => {
    const csv = ['Email,Name,Subscribed At,Active']
    subscribers.forEach(s => {
      csv.push(`${s.email},${s.name || ''},${s.subscribed_at},${s.is_active}`)
    })
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    toast.success('CSV exported!')
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('newsletter_subscribers').update({ is_active: !current, unsubscribed_at: !current ? null : new Date().toISOString() }).eq('id', id)
    load()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Mail className="w-5 h-5 text-blue-400" /> Newsletter
          </h1>
          <div className="flex gap-2">
            <button onClick={load} className="admin-btn-secondary"><RefreshCw className="w-4 h-4" /></button>
            <button onClick={exportCSV} className="admin-btn-secondary"><Download className="w-4 h-4" /> Export CSV</button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="admin-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{total}</div>
              <div className="text-xs text-gray-500">মোট সাবস্ক্রাইবার</div>
            </div>
          </div>
          <div className="admin-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-600/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{activeCount}</div>
              <div className="text-xs text-gray-500">Active সাবস্ক্রাইবার</div>
            </div>
          </div>
          <div className="admin-card p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/10 flex items-center justify-center">
              <Users className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <div className="text-2xl font-bold text-white">{total - activeCount}</div>
              <div className="text-xs text-gray-500">Unsubscribed</div>
            </div>
          </div>
        </div>

        {/* Subscribers table */}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">Email</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">নাম</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">সোর্স</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-36">তারিখ</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {subscribers.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3 text-white font-mono text-xs">{sub.email}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{sub.name || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{sub.source}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{new Date(sub.subscribed_at).toLocaleDateString('bn-BD')}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(sub.id, sub.is_active)}>
                        <span className={sub.is_active ? 'status-badge-published' : 'status-badge-failed'}>
                          {sub.is_active ? 'Active' : 'Unsub'}
                        </span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {subscribers.length === 0 && <div className="text-center py-12 text-gray-500">কোনো সাবস্ক্রাইবার নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
