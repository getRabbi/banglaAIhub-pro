'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { Save, Plus, Trash2, Loader2, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'
import { createClient } from '@/lib/supabase'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showTokens, setShowTokens] = useState(false)
  const [settings, setSettings] = useState<Record<string, any>>({})
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from('site_settings').select('key, value')
      const s: Record<string, any> = {}
      data?.forEach(row => { s[row.key] = row.value })
      setSettings(s)
      setLoading(false)
    }
    load()
  }, [])

  const set = (key: string, val: any) => setSettings(s => ({ ...s, [key]: val }))

  const save = async () => {
    setSaving(true)
    try {
      const upserts = Object.entries(settings).map(([key, value]) => ({ key, value }))
      const { error } = await supabase.from('site_settings').upsert(upserts, { onConflict: 'key' })
      if (error) throw error
      toast.success('সেটিং সংরক্ষণ হয়েছে!')
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setSaving(false)
    }
  }

  const addTime = () => {
    const times = settings.post_schedule_times || []
    set('post_schedule_times', [...times, '12:00'])
  }
  const removeTime = (i: number) => {
    const times = [...(settings.post_schedule_times || [])]
    times.splice(i, 1)
    set('post_schedule_times', times)
  }
  const updateTime = (i: number, val: string) => {
    const times = [...(settings.post_schedule_times || [])]
    times[i] = val
    set('post_schedule_times', times)
  }

  const addKeyword = () => {
    const kw = [...(settings.keyword_blacklist || []), '']
    set('keyword_blacklist', kw)
  }
  const removeKeyword = (i: number) => {
    const kw = [...(settings.keyword_blacklist || [])]
    kw.splice(i, 1)
    set('keyword_blacklist', kw)
  }
  const updateKeyword = (i: number, val: string) => {
    const kw = [...(settings.keyword_blacklist || [])]
    kw[i] = val
    set('keyword_blacklist', kw)
  }

  if (loading) return (
    <AdminLayout>
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
      </div>
    </AdminLayout>
  )

  const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="font-semibold text-white text-sm border-b border-gray-800 pb-2 mb-4">{children}</h2>
  )

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">Settings</h1>
          <button onClick={save} disabled={saving} className="admin-btn-primary">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            সংরক্ষণ করুন
          </button>
        </div>

        {/* OpenClaw Schedule */}
        <div className="admin-card p-5">
          <SectionTitle>🤖 OpenClaw Automation</SectionTitle>
          <div className="space-y-4">
            <label className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-200">Automation চালু</div>
                <div className="text-xs text-gray-500">বন্ধ করলে daily automation থামবে</div>
              </div>
              <button
                onClick={() => set('openclaw_enabled', !settings.openclaw_enabled)}
                className={`relative w-11 h-6 rounded-full transition-colors ${settings.openclaw_enabled ? 'bg-blue-600' : 'bg-gray-700'}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${settings.openclaw_enabled ? 'left-6' : 'left-1'}`} />
              </button>
            </label>

            {/* Daily post count */}
            <div>
              <label className="admin-label">
                দিনে কতটি পোস্ট হবে?{' '}
                <span className="text-blue-400 font-bold text-base">{settings.daily_post_count || 3}</span>
              </label>
              <input
                type="range" min={1} max={20}
                value={settings.daily_post_count || 3}
                onChange={e => set('daily_post_count', parseInt(e.target.value))}
                className="w-full accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>১টি (কম)</span>
                <span>১০টি (মধ্যম)</span>
                <span>২০টি (বেশি)</span>
              </div>
            </div>

            {/* Schedule times */}
            <div>
              <label className="admin-label">Post করার সময় (Bangladesh Time)</label>
              <div className="space-y-2">
                {(settings.post_schedule_times || []).map((time: string, i: number) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="time"
                      value={time}
                      onChange={e => updateTime(i, e.target.value)}
                      className="admin-input flex-1"
                    />
                    <button onClick={() => removeTime(i)} className="p-2 rounded-lg text-red-400 hover:bg-red-900/20">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <button onClick={addTime} className="admin-btn-secondary text-xs">
                  <Plus className="w-3.5 h-3.5" /> সময় যোগ করুন
                </button>
              </div>
            </div>

            {/* Source weights */}
            <div>
              <label className="admin-label">Source Priority (মোট ১০০)</label>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(settings.source_weights || {}).map(([source, weight]) => (
                  <div key={source}>
                    <label className="text-xs text-gray-500 mb-1 block capitalize">{source}: <span className="text-blue-400">{weight as number}%</span></label>
                    <input type="range" min={0} max={100}
                      value={weight as number}
                      onChange={e => set('source_weights', { ...settings.source_weights, [source]: parseInt(e.target.value) })}
                      className="w-full accent-blue-600"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Min word count */}
            <div>
              <label className="admin-label">সর্বনিম্ন শব্দ সংখ্যা</label>
              <input type="number" className="admin-input" min={300} max={3000}
                value={settings.min_word_count || 800}
                onChange={e => set('min_word_count', parseInt(e.target.value))}
              />
            </div>
          </div>
        </div>

        {/* Facebook Settings */}
        <div className="admin-card p-5">
          <SectionTitle>📘 Facebook Settings</SectionTitle>
          <div className="space-y-4">
            <div>
              <label className="admin-label">Facebook Page ID</label>
              <input className="admin-input" value={settings.facebook_page_id || ''}
                onChange={e => set('facebook_page_id', e.target.value)}
                placeholder="1234567890"
              />
            </div>
            <div>
              <label className="admin-label flex items-center justify-between">
                <span>Page Access Token</span>
                <button onClick={() => setShowTokens(!showTokens)} className="text-gray-500 hover:text-gray-300">
                  {showTokens ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </label>
              <input
                className="admin-input font-mono text-xs"
                type={showTokens ? 'text' : 'password'}
                value={settings.facebook_access_token || ''}
                onChange={e => set('facebook_access_token', e.target.value)}
                placeholder="EAAxxxxxxxx..."
              />
            </div>
            <div>
              <label className="admin-label">Comment Delay (মিনিট)</label>
              <input type="number" className="admin-input" min={1} max={60}
                value={settings.facebook_comment_delay_minutes || 5}
                onChange={e => set('facebook_comment_delay_minutes', parseInt(e.target.value))}
              />
              <p className="text-xs text-gray-500 mt-1">Post করার কত মিনিট পরে comment-এ blog link দেবে</p>
            </div>
            <div>
              <label className="admin-label">Default Hashtags</label>
              <div className="flex flex-wrap gap-2">
                {(settings.default_facebook_hashtags || []).map((tag: string, i: number) => (
                  <span key={i} className="flex items-center gap-1 px-2 py-1 bg-gray-800 rounded-lg text-sm text-blue-400">
                    {tag}
                    <button onClick={() => {
                      const tags = [...settings.default_facebook_hashtags]
                      tags.splice(i, 1)
                      set('default_facebook_hashtags', tags)
                    }}>
                      <XIcon className="w-3 h-3 text-gray-500 hover:text-red-400" />
                    </button>
                  </span>
                ))}
                <button onClick={() => {
                  const tag = prompt('নতুন hashtag (# সহ):')
                  if (tag) set('default_facebook_hashtags', [...(settings.default_facebook_hashtags || []), tag])
                }} className="px-2 py-1 bg-gray-800 rounded-lg text-sm text-gray-400 hover:text-white">
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* API Keys */}
        <div className="admin-card p-5">
          <SectionTitle>🔑 API Keys</SectionTitle>
          <div className="space-y-4">
            {[
              { key: 'gemini_api_key', label: 'Gemini API Key', placeholder: 'AIza...' },
              { key: 'unsplash_access_key', label: 'Unsplash Access Key', placeholder: 'Thumbnail auto fetch' },
              { key: 'reddit_client_id', label: 'Reddit Client ID', placeholder: 'Reddit API' },
              { key: 'reddit_client_secret', label: 'Reddit Client Secret', placeholder: 'Reddit API' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <label className="admin-label">{label}</label>
                <input
                  className="admin-input font-mono text-xs"
                  type={showTokens ? 'text' : 'password'}
                  value={settings[key] || ''}
                  onChange={e => set(key, e.target.value)}
                  placeholder={placeholder}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Keyword Blacklist */}
        <div className="admin-card p-5">
          <SectionTitle>🚫 Keyword Blacklist</SectionTitle>
          <p className="text-xs text-gray-500 mb-3">এই keyword থাকলে topic automatically skip হবে</p>
          <div className="space-y-2">
            {(settings.keyword_blacklist || []).map((kw: string, i: number) => (
              <div key={i} className="flex gap-2">
                <input className="admin-input flex-1"
                  value={kw}
                  onChange={e => updateKeyword(i, e.target.value)}
                />
                <button onClick={() => removeKeyword(i)} className="p-2 rounded-lg text-red-400 hover:bg-red-900/20">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button onClick={addKeyword} className="admin-btn-secondary text-xs">
              <Plus className="w-3.5 h-3.5" /> Keyword যোগ করুন
            </button>
          </div>
        </div>

        {/* Site info */}
        <div className="admin-card p-5">
          <SectionTitle>🌐 Site Info</SectionTitle>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Site URL</label>
              <input className="admin-input" value={settings.site_url || ''}
                onChange={e => set('site_url', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Admin URL</label>
              <input className="admin-input" value={settings.admin_url || ''}
                onChange={e => set('admin_url', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="admin-label">Email Alert</label>
              <input className="admin-input" type="email" value={settings.email_alert_address || ''}
                onChange={e => set('email_alert_address', e.target.value)}
                placeholder="Error alert পাঠানো হবে এই email-এ" />
            </div>
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
        >
          {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
          সব সেটিং সংরক্ষণ করুন
        </button>
      </div>
    </AdminLayout>
  )
}

function XIcon({ className }: { className: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
}
