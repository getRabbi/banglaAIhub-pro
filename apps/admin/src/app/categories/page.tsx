'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Plus, Trash2, Edit, Save, X } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY = { name_en: '', name_bn: '', slug: '', description_bn: '', icon: '🤖', color: '#4d9fff', sort_order: 0, is_featured: false }

export default function CategoriesAdminPage() {
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [editId, setEditId] = useState<string | null>(null)
  const [editData, setEditData] = useState<any>(null)
  const [showNew, setShowNew] = useState(false)
  const [newCat, setNewCat] = useState<any>(EMPTY)
  const [saving, setSaving] = useState(false)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('sort_order')
    setCategories(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const startEdit = (cat: any) => { setEditId(cat.id); setEditData({ ...cat }) }
  const cancelEdit = () => { setEditId(null); setEditData(null) }

  const saveEdit = async () => {
    setSaving(true)
    const { error } = await supabase.from('categories').update(editData).eq('id', editId)
    if (error) toast.error(error.message)
    else { toast.success('আপডেট হয়েছে!'); cancelEdit(); load() }
    setSaving(false)
  }

  const saveNew = async () => {
    if (!newCat.name_en || !newCat.slug) { toast.error('নাম ও slug দিন'); return }
    setSaving(true)
    const { error } = await supabase.from('categories').insert(newCat)
    if (error) toast.error(error.message)
    else { toast.success('ক্যাটাগরি যুক্ত হয়েছে!'); setNewCat(EMPTY); setShowNew(false); load() }
    setSaving(false)
  }

  const deleteCat = async (id: string, name: string) => {
    if (!confirm(`"${name}" ডিলিট করবেন? এর সব টুলস unlinked হবে।`)) return
    await supabase.from('categories').delete().eq('id', id)
    toast.success('ডিলিট হয়েছে'); load()
  }

  const RowInput = ({ value, onChange, className = '' }: any) => (
    <input className={`admin-input py-1 text-xs ${className}`} value={value} onChange={e => onChange(e.target.value)} />
  )

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Categories Manager</h1>
          <button onClick={() => setShowNew(f => !f)} className="admin-btn-primary"><Plus className="w-4 h-4" /> নতুন ক্যাটাগরি</button>
        </div>

        {showNew && (
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">নতুন ক্যাটাগরি</h2>
            <div className="grid grid-cols-2 gap-4">
              <div><label className="admin-label">নাম (English)</label><input className="admin-input" value={newCat.name_en} onChange={e => setNewCat((c: any) => ({ ...c, name_en: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') }))} /></div>
              <div><label className="admin-label">নাম (বাংলা)</label><input className="admin-input" value={newCat.name_bn} onChange={e => setNewCat((c: any) => ({ ...c, name_bn: e.target.value }))} /></div>
              <div><label className="admin-label">Slug</label><input className="admin-input font-mono text-xs" value={newCat.slug} onChange={e => setNewCat((c: any) => ({ ...c, slug: e.target.value }))} /></div>
              <div><label className="admin-label">Icon (emoji)</label><input className="admin-input" value={newCat.icon} onChange={e => setNewCat((c: any) => ({ ...c, icon: e.target.value }))} /></div>
              <div><label className="admin-label">Color</label><input type="color" className="w-full h-10 rounded-lg cursor-pointer bg-gray-800 border border-gray-700" value={newCat.color} onChange={e => setNewCat((c: any) => ({ ...c, color: e.target.value }))} /></div>
              <div><label className="admin-label">Sort Order</label><input type="number" className="admin-input" value={newCat.sort_order} onChange={e => setNewCat((c: any) => ({ ...c, sort_order: parseInt(e.target.value) }))} /></div>
            </div>
            <div><label className="admin-label">বিবরণ (বাংলা)</label><textarea rows={2} className="admin-input resize-none" value={newCat.description_bn} onChange={e => setNewCat((c: any) => ({ ...c, description_bn: e.target.value }))} /></div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={newCat.is_featured} onChange={e => setNewCat((c: any) => ({ ...c, is_featured: e.target.checked }))} className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
              <span className="text-sm text-gray-300">Homepage-এ দেখাও</span>
            </label>
            <div className="flex gap-2">
              <button onClick={saveNew} disabled={saving} className="admin-btn-primary">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} সংরক্ষণ</button>
              <button onClick={() => setShowNew(false)} className="admin-btn-secondary">বাতিল</button>
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
                  <th className="px-4 py-3 text-gray-400 font-medium">ক্যাটাগরি</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Slug</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20 text-center">টুলস</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20 text-center">Featured</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-20 text-center">Order</th>
                  <th className="px-4 py-3 text-gray-400 font-medium w-24">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {categories.map(cat => {
                  const isEditing = editId === cat.id
                  const d = isEditing ? editData : cat
                  return (
                    <tr key={cat.id} className={`${isEditing ? 'bg-blue-950/20' : 'hover:bg-gray-800/50'} transition-colors`}>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-2">
                            <input className="admin-input py-1 w-8 text-center" value={d.icon} onChange={e => setEditData((x: any) => ({ ...x, icon: e.target.value }))} />
                            <input className="admin-input py-1 flex-1" value={d.name_bn} onChange={e => setEditData((x: any) => ({ ...x, name_bn: e.target.value }))} />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-xl">{cat.icon}</span>
                            <div>
                              <div className="font-medium text-white">{cat.name_bn}</div>
                              <div className="text-xs text-gray-500">{cat.name_en}</div>
                            </div>
                            <div className="w-3 h-3 rounded-full ml-1" style={{ backgroundColor: cat.color }} />
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing
                          ? <RowInput value={d.slug} onChange={(v: string) => setEditData((x: any) => ({ ...x, slug: v }))} className="font-mono" />
                          : <code className="text-xs text-gray-500">{cat.slug}</code>}
                      </td>
                      <td className="px-4 py-3 text-center text-gray-400">{cat.tool_count}</td>
                      <td className="px-4 py-3 text-center">
                        {isEditing
                          ? <input type="checkbox" checked={d.is_featured} onChange={e => setEditData((x: any) => ({ ...x, is_featured: e.target.checked }))} className="w-4 h-4" />
                          : <span className={cat.is_featured ? 'text-green-400' : 'text-gray-600'}>{cat.is_featured ? '✓' : '—'}</span>}
                      </td>
                      <td className="px-4 py-3 text-center">
                        {isEditing
                          ? <RowInput value={d.sort_order} onChange={(v: string) => setEditData((x: any) => ({ ...x, sort_order: parseInt(v) }))} className="w-16 text-center" />
                          : <span className="text-gray-400">{cat.sort_order}</span>}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex gap-1">
                            <button onClick={saveEdit} disabled={saving} className="p-1.5 rounded bg-blue-600 hover:bg-blue-700 text-white">
                              {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={cancelEdit} className="p-1.5 rounded hover:bg-gray-700 text-gray-400"><X className="w-3.5 h-3.5" /></button>
                          </div>
                        ) : (
                          <div className="flex gap-1">
                            <button onClick={() => startEdit(cat)} className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
                            <button onClick={() => deleteCat(cat.id, cat.name_bn)} className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
