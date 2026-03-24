'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Plus, Trash2, Tag, Edit } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { title: '', slug: '', tool_name: '', description_bn: '', deal_type: 'discount', coupon_code: '', discount_percent: '', affiliate_url: '', original_price_usd: '', deal_price_usd: '', expires_at: '', is_featured: false, is_verified: false, status: 'published' }

export default function DealsPage() {
  const [deals, setDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('deals').select('*').order('created_at', { ascending: false })
    setDeals(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const up = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }))

  const autoSlug = (title: string) => {
    if (!editId) up('slug', title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').substring(0, 60))
  }

  const save = async () => {
    if (!form.title || !form.tool_name) { toast.error('শিরোনাম ও টুলের নাম দিন'); return }
    setSaving(true)
    const payload = { ...form, discount_percent: form.discount_percent ? parseInt(form.discount_percent) : null, original_price_usd: form.original_price_usd ? parseFloat(form.original_price_usd) : null, deal_price_usd: form.deal_price_usd ? parseFloat(form.deal_price_usd) : null, expires_at: form.expires_at || null }
    const { error } = editId
      ? await supabase.from('deals').update(payload).eq('id', editId)
      : await supabase.from('deals').insert(payload)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(editId ? 'আপডেট হয়েছে!' : 'Deal যুক্ত হয়েছে!')
    setForm(EMPTY); setShowForm(false); setEditId(null); setSaving(false); load()
  }

  const startEdit = (deal: any) => {
    setForm({ ...deal, discount_percent: deal.discount_percent || '', original_price_usd: deal.original_price_usd || '', deal_price_usd: deal.deal_price_usd || '', expires_at: deal.expires_at ? deal.expires_at.substring(0, 16) : '' })
    setEditId(deal.id); setShowForm(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const deleteDeal = async (id: string) => {
    if (!confirm('ডিলিট করবেন?')) return
    await supabase.from('deals').delete().eq('id', id)
    toast.success('ডিলিট হয়েছে'); load()
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2"><Tag className="w-5 h-5 text-red-400" /> Deals Manager</h1>
          <button onClick={() => { setForm(EMPTY); setEditId(null); setShowForm(f => !f) }} className="admin-btn-primary">
            <Plus className="w-4 h-4" /> নতুন Deal
          </button>
        </div>

        {showForm && (
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">{editId ? 'Deal সম্পাদনা' : 'নতুন Deal'}</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">শিরোনাম *</label>
                <input className="admin-input" value={form.title} onChange={e => { up('title', e.target.value); autoSlug(e.target.value) }} />
              </div>
              <div>
                <label className="admin-label">Slug</label>
                <input className="admin-input font-mono text-xs" value={form.slug} onChange={e => up('slug', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">টুলের নাম *</label>
                <input className="admin-input" value={form.tool_name} onChange={e => up('tool_name', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Deal Type</label>
                <select className="admin-input" value={form.deal_type} onChange={e => up('deal_type', e.target.value)}>
                  <option value="discount">Discount</option>
                  <option value="lifetime">Lifetime Deal</option>
                  <option value="coupon">Coupon</option>
                  <option value="free_trial">Free Trial</option>
                </select>
              </div>
            </div>
            <div>
              <label className="admin-label">বিবরণ (বাংলা)</label>
              <textarea rows={2} className="admin-input resize-none" value={form.description_bn} onChange={e => up('description_bn', e.target.value)} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="admin-label">Affiliate URL</label>
                <input className="admin-input" type="url" value={form.affiliate_url} onChange={e => up('affiliate_url', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Coupon Code</label>
                <input className="admin-input font-mono" value={form.coupon_code} onChange={e => up('coupon_code', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Discount %</label>
                <input className="admin-input" type="number" value={form.discount_percent} onChange={e => up('discount_percent', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Original Price ($)</label>
                <input className="admin-input" type="number" step="0.01" value={form.original_price_usd} onChange={e => up('original_price_usd', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">Deal Price ($)</label>
                <input className="admin-input" type="number" step="0.01" value={form.deal_price_usd} onChange={e => up('deal_price_usd', e.target.value)} />
              </div>
              <div>
                <label className="admin-label">মেয়াদ শেষ</label>
                <input className="admin-input" type="datetime-local" value={form.expires_at} onChange={e => up('expires_at', e.target.value)} />
              </div>
            </div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_featured} onChange={e => up('is_featured', e.target.checked)} className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
                <span className="text-sm text-gray-300">Featured</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.is_verified} onChange={e => up('is_verified', e.target.checked)} className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
                <span className="text-sm text-gray-300">Verified</span>
              </label>
              <select className="admin-input w-auto" value={form.status} onChange={e => up('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button onClick={save} disabled={saving} className="admin-btn-primary">
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} সংরক্ষণ
              </button>
              <button onClick={() => { setShowForm(false); setEditId(null); setForm(EMPTY) }} className="admin-btn-secondary">বাতিল</button>
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
                  <th className="px-4 py-3 text-gray-400 font-medium">Deal</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-28">Type</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">ছাড়</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-32">মেয়াদ</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Status</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20">Clicks</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {deals.map(deal => {
                  const expired = deal.expires_at && new Date(deal.expires_at) < new Date()
                  return (
                    <tr key={deal.id} className={`hover:bg-gray-800/50 ${expired ? 'opacity-50' : ''}`}>
                      <td className="px-4 py-3">
                        <div className="font-medium text-white">{deal.title}</div>
                        <div className="text-xs text-gray-500">{deal.tool_name} {deal.coupon_code && `· ${deal.coupon_code}`}</div>
                        {deal.is_featured && <span className="text-xs text-amber-400">★ Featured</span>}
                      </td>
                      <td className="px-4 py-3 text-gray-400 text-xs">{deal.deal_type}</td>
                      <td className="px-4 py-3 text-green-400 font-bold">{deal.discount_percent ? `${deal.discount_percent}%` : '—'}</td>
                      <td className="px-4 py-3 text-xs text-gray-500">
                        {deal.expires_at ? (expired ? <span className="text-red-400">মেয়াদ শেষ</span> : new Date(deal.expires_at).toLocaleDateString('bn-BD')) : 'কোনো মেয়াদ নেই'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={deal.status === 'published' ? 'status-badge-published' : 'status-badge-draft'}>{deal.status}</span>
                      </td>
                      <td className="px-4 py-3 text-gray-400">{deal.click_count || 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => startEdit(deal)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                          <button onClick={() => deleteDeal(deal.id)} className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            {deals.length === 0 && <div className="text-center py-12 text-gray-500">কোনো deal নেই</div>}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
