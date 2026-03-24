'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState } from 'react'
import { Zap, Loader2, CheckCircle, AlertCircle, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

const CONTENT_TYPES = [
  { value: 'blog', label: '📝 ব্লগ পোস্ট' },
  { value: 'tool_review', label: '🛠️ টুল রিভিউ' },
  { value: 'comparison', label: '⚖️ তুলনা' },
  { value: 'top_list', label: '📋 টপ লিস্ট' },
  { value: 'guide', label: '📖 গাইড' },
  { value: 'money_making', label: '💰 আয় করুন' },
]

const REWRITE_STYLES = [
  { value: 'expand_full_blog', label: '📄 পূর্ণ ব্লগ বানাও' },
  { value: 'rewrite_professionally', label: '✨ প্রফেশনাল রিরাইট' },
  { value: 'affiliate_focused', label: '🔗 Affiliate Focus' },
  { value: 'stronger_hook', label: '⚡ Strong Hook' },
  { value: 'use_input', label: '📋 Input যেমন আছে' },
]

const PLATFORMS = ['reddit', 'x', 'producthunt', 'hackernews', 'manual']

interface Result {
  blog_slug?: string
  fb_post_id?: string
  error?: string
}

export default function QuickSubmitPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)
  const [form, setForm] = useState({
    source_title: '',
    source_url: '',
    source_platform: 'manual',
    main_idea: '',
    category_id: '',
    tool_name: '',
    affiliate_link_id: '',
    content_type: 'blog',
    rewrite_style: 'expand_full_blog',
    publish_now: true,
    scheduled_at: '',
    generate_facebook_post: true,
    thumbnail_url: '',
  })

  const update = (key: string, val: unknown) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.source_title || !form.main_idea) {
      toast.error('শিরোনাম ও মূল ধারণা দিতে হবে')
      return
    }
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/quick-submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_SECRET || '',
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'ব্যর্থ হয়েছে')
      setResult(data)
      toast.success('সফলভাবে publish হয়েছে!')
    } catch (err: any) {
      toast.error(err.message)
      setResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-800 flex items-center justify-center">
            <Zap className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">Quick Submit</h1>
            <p className="text-sm text-gray-400">তথ্য দিন → AI লিখবে → Auto publish হবে</p>
          </div>
        </div>

        {/* Result card */}
        {result && (
          <div className={`admin-card p-4 mb-6 flex items-start gap-3 ${result.error ? 'border-red-800' : 'border-green-800'}`}>
            {result.error
              ? <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />
              : <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
            }
            <div>
              {result.error
                ? <p className="text-red-400 text-sm">{result.error}</p>
                : (
                  <div className="space-y-1">
                    <p className="text-green-400 text-sm font-medium">✅ সফলভাবে publish হয়েছে!</p>
                    {result.blog_slug && (
                      <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${result.blog_slug}`}
                        target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                      >
                        Blog post দেখুন <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                    {result.fb_post_id && (
                      <p className="text-sm text-gray-400">Facebook Post ID: {result.fb_post_id}</p>
                    )}
                  </div>
                )
              }
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Source info */}
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">📌 সোর্স তথ্য</h2>

            <div>
              <label className="admin-label">শিরোনাম / টপিক *</label>
              <input className="admin-input" value={form.source_title}
                onChange={e => update('source_title', e.target.value)}
                placeholder="যেমন: ChatGPT দিয়ে ফ্রিল্যান্সিং শুরু করুন"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">সোর্স প্ল্যাটফর্ম</label>
                <select className="admin-input" value={form.source_platform}
                  onChange={e => update('source_platform', e.target.value)}
                >
                  {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">সোর্স লিংক (optional)</label>
                <input className="admin-input" value={form.source_url}
                  onChange={e => update('source_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div>
              <label className="admin-label">মূল ধারণা / নোটস *</label>
              <textarea rows={4} className="admin-input resize-none"
                value={form.main_idea}
                onChange={e => update('main_idea', e.target.value)}
                placeholder="পোস্টে কী থাকবে তা লিখুন — AI এটা দেখে পূর্ণ বাংলা ব্লগ বানাবে"
              />
            </div>
          </div>

          {/* Content settings */}
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">⚙️ Content সেটিং</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">Content Type</label>
                <select className="admin-input" value={form.content_type}
                  onChange={e => update('content_type', e.target.value)}
                >
                  {CONTENT_TYPES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className="admin-label">AI Rewrite Style</label>
                <select className="admin-input" value={form.rewrite_style}
                  onChange={e => update('rewrite_style', e.target.value)}
                >
                  {REWRITE_STYLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="admin-label">টুলের নাম (optional)</label>
                <input className="admin-input" value={form.tool_name}
                  onChange={e => update('tool_name', e.target.value)}
                  placeholder="ChatGPT, Midjourney..."
                />
              </div>
              <div>
                <label className="admin-label">Thumbnail URL (optional)</label>
                <input className="admin-input" value={form.thumbnail_url}
                  onChange={e => update('thumbnail_url', e.target.value)}
                  placeholder="ফাঁকা রাখলে Unsplash থেকে auto নেবে"
                />
              </div>
            </div>
          </div>

          {/* Publish settings */}
          <div className="admin-card p-5 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2">📅 Publish সেটিং</h2>

            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.publish_now}
                  onChange={e => update('publish_now', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600"
                />
                <span className="text-sm text-gray-300">এখনই Publish করো</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.generate_facebook_post}
                  onChange={e => update('generate_facebook_post', e.target.checked)}
                  className="w-4 h-4 rounded border-gray-700 bg-gray-800 text-blue-600"
                />
                <span className="text-sm text-gray-300">Facebook Post করো</span>
              </label>
            </div>

            {!form.publish_now && (
              <div>
                <label className="admin-label">Schedule করুন</label>
                <input type="datetime-local" className="admin-input"
                  value={form.scheduled_at}
                  onChange={e => update('scheduled_at', e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-base"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                AI লিখছে ও publish করছে...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                Generate & Publish করুন
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-600">
            AI বাংলায় পূর্ণ ব্লগ লিখবে → SEO optimize করবে → Blog publish করবে → Facebook post করবে
          </p>
        </form>
      </div>
    </AdminLayout>
  )
}
