'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Upload, Loader2, CheckCircle, AlertCircle, Download } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ImportToolsPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [results, setResults] = useState<{ success: number; errors: string[] } | null>(null)
  const supabase = createClient()

  const downloadTemplate = () => {
    const csv = 'name,slug,tagline_bn,website_url,pricing_type,starting_price_usd,has_free_plan,logo_url,overall_rating\nChatGPT,chatgpt,সেরা AI চ্যাটবট,https://chat.openai.com,freemium,20,true,https://logo.com/chatgpt.png,4.8'
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'tools-template.csv'; a.click()
  }

  const handleImport = async () => {
    if (!file) { toast.error('CSV ফাইল বেছে নিন'); return }
    setLoading(true)
    setResults(null)
    try {
      const text = await file.text()
      const lines = text.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim())
      const rows = lines.slice(1)
      let success = 0
      const errors: string[] = []

      for (let i = 0; i < rows.length; i++) {
        const vals = rows[i].split(',').map(v => v.trim().replace(/^"|"$/g, ''))
        const obj: Record<string, any> = {}
        headers.forEach((h, j) => { obj[h] = vals[j] || '' })

        if (!obj.name || !obj.slug) { errors.push(`Row ${i + 2}: name ও slug দরকার`); continue }

        const toolData = {
          name: obj.name, slug: obj.slug, tagline_bn: obj.tagline_bn || null,
          website_url: obj.website_url || null,
          pricing_type: ['free', 'freemium', 'paid', 'open_source'].includes(obj.pricing_type) ? obj.pricing_type : 'freemium',
          starting_price_usd: obj.starting_price_usd ? parseFloat(obj.starting_price_usd) : null,
          has_free_plan: obj.has_free_plan === 'true',
          logo_url: obj.logo_url || null,
          overall_rating: obj.overall_rating ? parseFloat(obj.overall_rating) : 0,
          ease_of_use_rating: 0, value_rating: 0, feature_rating: 0,
          status: 'published', key_features: [], pros: [], cons: [], best_for: [], use_cases: [], faq: [],
        }
        const { error } = await supabase.from('tools').upsert(toolData, { onConflict: 'slug' })
        if (error) errors.push(`Row ${i + 2} (${obj.name}): ${error.message}`)
        else success++
      }
      setResults({ success, errors })
      if (success > 0) toast.success(`${success}টি টুল import হয়েছে!`)
    } catch (e: any) { toast.error(e.message) }
    setLoading(false)
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">CSV Bulk Import</h1>
          <button onClick={downloadTemplate} className="admin-btn-secondary text-xs">
            <Download className="w-4 h-4" /> Template Download করুন
          </button>
        </div>

        <div className="admin-card p-5 space-y-4">
          <div className="p-4 bg-blue-950/30 border border-blue-800 rounded-lg text-sm text-blue-300">
            <p className="font-medium mb-2">CSV Format:</p>
            <code className="text-xs font-mono block">name, slug, tagline_bn, website_url, pricing_type, starting_price_usd, has_free_plan, logo_url, overall_rating</code>
            <p className="mt-2 text-xs">pricing_type: free | freemium | paid | open_source</p>
          </div>

          <div>
            <label className="admin-label">CSV ফাইল বেছে নিন</label>
            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${file ? 'border-blue-600 bg-blue-950/20' : 'border-gray-700 hover:border-gray-600'}`}>
              <input type="file" accept=".csv" className="hidden" id="csv-input"
                onChange={e => setFile(e.target.files?.[0] || null)} />
              <label htmlFor="csv-input" className="cursor-pointer">
                <Upload className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                {file ? (
                  <div>
                    <p className="text-white font-medium">{file.name}</p>
                    <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-gray-400">Click করুন বা ফাইল drag করুন</p>
                    <p className="text-gray-600 text-sm mt-1">.csv ফাইল</p>
                  </div>
                )}
              </label>
            </div>
          </div>

          <button onClick={handleImport} disabled={!file || loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
            {loading ? <><Loader2 className="w-5 h-5 animate-spin" /> Import করছে...</> : <><Upload className="w-5 h-5" /> Import শুরু করুন</>}
          </button>
        </div>

        {results && (
          <div className="admin-card p-5 space-y-3">
            <h2 className="font-semibold text-white">ফলাফল</h2>
            <div className="flex items-center gap-2 text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span>{results.success}টি টুল সফলভাবে import হয়েছে</span>
            </div>
            {results.errors.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-red-400 mb-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>{results.errors.length}টি error</span>
                </div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {results.errors.map((err, i) => (
                    <p key={i} className="text-xs text-red-400 font-mono">{err}</p>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
