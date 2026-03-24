'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Save, Plus, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

const DEFAULT_TOOL = {
  name: '', slug: '', tagline_bn: '', description_bn: '', website_url: '',
  category_id: '', pricing_type: 'freemium', starting_price_usd: '',
  has_free_plan: false, free_plan_details_bn: '', platforms: [],
  logo_url: '', overall_rating: 4.0, ease_of_use_rating: 4.0,
  value_rating: 4.0, feature_rating: 4.0,
  is_editors_choice: false, is_best_for_beginners: false, is_best_value: false,
  is_free_forever: false, is_trending: false, is_new: true,
  key_features: [''], pros: [''], cons: [''], best_for: [''], use_cases: [''],
  who_should_use_bn: '', expert_verdict_bn: '',
  meta_title: '', meta_description: '', status: 'published',
}

export default function NewToolPage({ params }: { params?: { id?: string } }) {
  const [tool, setTool] = useState<any>(DEFAULT_TOOL)
  const [categories, setCategories] = useState<any[]>([])
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(!!params?.id)
  const supabase = createClient()
  const router = useRouter()
  const isEdit = !!params?.id

  useEffect(() => {
    supabase.from('categories').select('id, name_bn').order('sort_order').then(({ data }) => setCategories(data || []))
    if (isEdit) {
      supabase.from('tools').select('*').eq('id', params!.id).single()
        .then(({ data }) => { if (data) { setTool(data); setLoading(false) } })
    }
  }, [])

  const up = (key: string, val: any) => setTool((t: any) => ({ ...t, [key]: val }))
  const upArr = (key: string, i: number, val: string) => {
    const arr = [...(tool[key] || [])]
    arr[i] = val
    up(key, arr)
  }
  const addArr = (key: string) => up(key, [...(tool[key] || []), ''])
  const removeArr = (key: string, i: number) => up(key, (tool[key] || []).filter((_: any, idx: number) => idx !== i))

  const autoSlug = (name: string) => {
    if (!isEdit) up('slug', name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-'))
  }

  const save = async () => {
    if (!tool.name || !tool.slug) { toast.error('নাম ও slug দিতে হবে'); return }
    setSaving(true)
    const payload = {
      ...tool,
      starting_price_usd: tool.starting_price_usd ? parseFloat(tool.starting_price_usd) : null,
      key_features: tool.key_features.filter(Boolean),
      pros: tool.pros.filter(Boolean),
      cons: tool.cons.filter(Boolean),
      best_for: tool.best_for.filter(Boolean),
      use_cases: tool.use_cases.filter(Boolean),
      faq: tool.faq || [],
    }
    const { error } = isEdit
      ? await supabase.from('tools').update(payload).eq('id', params!.id)
      : await supabase.from('tools').insert(payload)
    if (error) { toast.error(error.message); setSaving(false); return }
    toast.success(isEdit ? 'টুল আপডেট হয়েছে!' : 'নতুন টুল যুক্ত হয়েছে!')
    router.push('/tools')
  }

  const ArrayField = ({ label, fieldKey }: { label: string; fieldKey: string }) => (
    <div>
      <label className="admin-label">{label}</label>
      <div className="space-y-2">
        {(tool[fieldKey] || ['']).map((val: string, i: number) => (
          <div key={i} className="flex gap-2">
            <input className="admin-input flex-1" value={val}
              onChange={e => upArr(fieldKey, i, e.target.value)}
              placeholder={`${label} ${i + 1}`} />
            <button onClick={() => removeArr(fieldKey, i)} className="p-2 text-gray-500 hover:text-red-400">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        <button onClick={() => addArr(fieldKey)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" /> যোগ করুন
        </button>
      </div>
    </div>
  )

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">{isEdit ? 'টুল সম্পাদনা' : 'নতুন টুল যুক্ত করুন'}</h1>
          <button onClick={save} disabled={saving} className="admin-btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} সংরক্ষণ
          </button>
        </div>

        {/* Basic Info */}
        <div className="admin-card p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">📋 মূল তথ্য</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">টুলের নাম *</label>
              <input className="admin-input" value={tool.name}
                onChange={e => { up('name', e.target.value); autoSlug(e.target.value) }} />
            </div>
            <div>
              <label className="admin-label">Slug *</label>
              <input className="admin-input font-mono text-xs" value={tool.slug}
                onChange={e => up('slug', e.target.value)} />
            </div>
          </div>
          <div>
            <label className="admin-label">Tagline (বাংলা)</label>
            <input className="admin-input" value={tool.tagline_bn || ''} onChange={e => up('tagline_bn', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">বিবরণ (বাংলা)</label>
            <textarea rows={4} className="admin-input resize-none" value={tool.description_bn || ''}
              onChange={e => up('description_bn', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Website URL</label>
              <input className="admin-input" type="url" value={tool.website_url || ''} onChange={e => up('website_url', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Logo URL</label>
              <input className="admin-input" type="url" value={tool.logo_url || ''} onChange={e => up('logo_url', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">ক্যাটাগরি</label>
              <select className="admin-input" value={tool.category_id || ''} onChange={e => up('category_id', e.target.value)}>
                <option value="">বেছে নিন</option>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name_bn}</option>)}
              </select>
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-input" value={tool.status} onChange={e => up('status', e.target.value)}>
                <option value="published">Published</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="admin-card p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">💳 মূল্য তথ্য</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Pricing Type</label>
              <select className="admin-input" value={tool.pricing_type} onChange={e => up('pricing_type', e.target.value)}>
                <option value="free">Free</option>
                <option value="freemium">Freemium</option>
                <option value="paid">Paid</option>
                <option value="open_source">Open Source</option>
              </select>
            </div>
            <div>
              <label className="admin-label">Starting Price (USD/month)</label>
              <input className="admin-input" type="number" step="0.01" value={tool.starting_price_usd || ''}
                onChange={e => up('starting_price_usd', e.target.value)} placeholder="0.00" />
            </div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={tool.has_free_plan}
              onChange={e => up('has_free_plan', e.target.checked)}
              className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
            <span className="text-sm text-gray-300">ফ্রি প্ল্যান আছে</span>
          </label>
          {tool.has_free_plan && (
            <div>
              <label className="admin-label">ফ্রি প্ল্যানের বিবরণ</label>
              <input className="admin-input" value={tool.free_plan_details_bn || ''} onChange={e => up('free_plan_details_bn', e.target.value)} />
            </div>
          )}
        </div>

        {/* Ratings */}
        <div className="admin-card p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">⭐ রেটিং</h2>
          <div className="grid grid-cols-2 gap-4">
            {[['overall_rating', 'সামগ্রিক'], ['ease_of_use_rating', 'ব্যবহার সহজ'], ['value_rating', 'মান'], ['feature_rating', 'ফিচার']].map(([key, label]) => (
              <div key={key}>
                <label className="admin-label">{label}: <span className="text-blue-400">{tool[key]}</span></label>
                <input type="range" min="0" max="5" step="0.1" value={tool[key]}
                  onChange={e => up(key, parseFloat(e.target.value))} className="w-full accent-blue-600" />
              </div>
            ))}
          </div>
        </div>

        {/* Badges */}
        <div className="admin-card p-5">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2 mb-4">🏷️ Badge</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['is_editors_choice', '⭐ Editor\'s Choice'],
              ['is_best_for_beginners', '👶 Best for Beginners'],
              ['is_best_value', '💎 Best Value'],
              ['is_free_forever', '🆓 Free Forever'],
              ['is_trending', '🔥 Trending'],
              ['is_new', '✨ New'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={tool[key]}
                  onChange={e => up(key, e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800" />
                <span className="text-sm text-gray-300">{label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Content arrays */}
        <div className="admin-card p-5 space-y-5">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">📝 Content</h2>
          <ArrayField label="Key Features" fieldKey="key_features" />
          <ArrayField label="সুবিধা (Pros)" fieldKey="pros" />
          <ArrayField label="অসুবিধা (Cons)" fieldKey="cons" />
          <ArrayField label="Best For" fieldKey="best_for" />
          <div>
            <label className="admin-label">কার জন্য উপযুক্ত</label>
            <textarea rows={3} className="admin-input resize-none" value={tool.who_should_use_bn || ''}
              onChange={e => up('who_should_use_bn', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Expert Verdict</label>
            <textarea rows={3} className="admin-input resize-none" value={tool.expert_verdict_bn || ''}
              onChange={e => up('expert_verdict_bn', e.target.value)} />
          </div>
        </div>

        {/* SEO */}
        <div className="admin-card p-5 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">🔍 SEO</h2>
          <div>
            <label className="admin-label">Meta Title <span className="text-gray-600">({(tool.meta_title || '').length}/60)</span></label>
            <input className="admin-input" value={tool.meta_title || ''} onChange={e => up('meta_title', e.target.value)} maxLength={60} />
          </div>
          <div>
            <label className="admin-label">Meta Description <span className="text-gray-600">({(tool.meta_description || '').length}/160)</span></label>
            <textarea rows={2} className="admin-input resize-none" value={tool.meta_description || ''}
              onChange={e => up('meta_description', e.target.value)} maxLength={160} />
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          {isEdit ? 'টুল আপডেট করুন' : 'টুল যুক্ত করুন'}
        </button>
      </div>
    </AdminLayout>
  )
}
