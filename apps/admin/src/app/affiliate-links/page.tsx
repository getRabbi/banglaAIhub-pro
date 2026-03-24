'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Plus, Trash2, Copy, ExternalLink, Link2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AffiliateLinksPage() {
  const [links, setLinks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ tool_name: '', slug: '', destination_url: '', commission_info: '' })
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('affiliate_links')
      .select('*, tool:tools(name)')
      .order('click_count', { ascending: false })
    setLinks(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const save = async () => {
    if (!form.slug || !form.destination_url || !form.tool_name) { toast.error('সব ফিল্ড পূরণ করুন'); return }
    setSaving(true)
    const { error } = await supabase.from('affiliate_links').insert({
      tool_name: form.tool_name,
      slug: form.slug.toLowerCase().replace(/\s+/g, '-'),
      destination_url: form.destination_url,
      commission_info: form.commission_info,
      is_active: true,
    })
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success('Affiliate link যুক্ত হয়েছে!')
    setForm({ tool_name: '', slug: '', destination_url: '', commission_info: '' })
    setShowForm(false)
    setSaving(false)
    load()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('affiliate_links').update({ is_active: !current }).eq('id', id)
    load()
  }

  const deleteLink = async (id: string) => {
    if (!confirm('ডিলিট করবেন?')) return
    await supabase.from('affiliate_links').delete().eq('id', id)
    toast.success('ডিলিট হয়েছে')
    load()
  }

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`${process.env.NEXT_PUBLIC_SITE_URL}/go/${slug}`)
    toast.success('Link copied!')
  }

  const totalClicks = links.reduce((s, l) => s + (l.click_count || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Link2 className="w-5 h-5 text-blue-400" /> Affiliate Links
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">মোট {totalClicks.toLocaleString()} clicks</p>
          </div>
          <button onClick={() => setShowForm(f => !f)} className="admin-btn-primary">
            <Plus className="w-4 h-4" /> নতুন Link
          </button>
        </div>

        {showForm && (
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm">নতুন Affiliate Link</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">টুলের নাম</label>
                <input className="admin-input" value={form.tool_name} onChange={e => setForm(f => ({ ...f, tool_name: e.target.value }))} placeholder="ChatGPT" />
              </div>
              <div>
                <label className="admin-label">Slug (URL-এ যাবে)</label>
                <div className="flex items-center gap-1">
                  <span className="text-gray-500 text-sm">/go/</span>
                  <input className="admin-input font-mono text-xs flex-1" value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))} placeholder="chatgpt" />
                </div>
              </div>
            </div>
            <div>
              <label className="admin-label">Destination URL *</label>
              <input className="admin-input" type="url" value={form.destination_url}
                onChange={e => setForm(f => ({ ...f, destination_url: e.target.value }))} placeholder="https://..." />
            </div>
            <div>
              <label className="admin-label">Commission Info (optional)</label>
              <input className="admin-input" value={form.commission_info}
                onChange={e => setForm(f => ({ ...f, commission_info: e.target.value }))} placeholder="30% recurring" />
            </div>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="admin-btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} সংরক্ষণ
              </button>
              <button onClick={() => setShowForm(false)} className="admin-btn-secondary">বাতিল</button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div>
        ) : (
          <div className="admin-card overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-800 text-left">
                  <th className="px-4 py-3 text-gray-400 font-medium">টুল</th>
                  <th className="px-4 py-3 text-gray-400 font-medium">Short Link</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">Commission</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24 text-right">Clicks</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20">Status</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {links.map(link => (
                  <tr key={link.id} className="hover:bg-gray-800/50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-white">{link.tool_name}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-blue-400 font-mono">/go/{link.slug}</code>
                        <button onClick={() => copyLink(link.slug)} className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white">
                          <Copy className="w-3 h-3" />
                        </button>
                        <a href={link.destination_url} target="_blank" rel="noopener noreferrer"
                          className="p-1 hover:bg-gray-700 rounded text-gray-500 hover:text-white">
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">{link.commission_info || '—'}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-green-400">{link.click_count?.toLocaleString()}</span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => toggleActive(link.id, link.is_active)}>
                        <span className={link.is_active ? 'status-badge-published' : 'status-badge-failed'}>
                          {link.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => deleteLink(link.id)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {links.length === 0 && <div className="text-center py-12 text-gray-500">কোনো link নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
