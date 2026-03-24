'use client'
import { useState } from 'react'
import { Mail, Send, CheckCircle, Loader2 } from 'lucide-react'

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise(r => setTimeout(r, 1000))
    setDone(true)
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">যোগাযোগ করুন</h1>
        <p className="text-gray-500 dark:text-gray-400">প্রশ্ন, পরামর্শ বা sponsored post-এর জন্য লিখুন</p>
      </div>

      {done ? (
        <div className="card p-10 text-center">
          <CheckCircle className="w-14 h-14 text-green-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">বার্তা পাঠানো হয়েছে!</h2>
          <p className="text-gray-500">আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেব।</p>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নাম *</label>
              <input required className="input" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="আপনার নাম" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল *</label>
              <input required type="email" className="input" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বিষয়</label>
            <select className="input" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}>
              <option value="">বেছে নিন</option>
              <option>সাধারণ প্রশ্ন</option>
              <option>টুল সাবমিট</option>
              <option>Sponsored Post</option>
              <option>Partnership</option>
              <option>Bug Report</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">বার্তা *</label>
            <textarea required rows={5} className="input resize-none" value={form.message}
              onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="আপনার বার্তা লিখুন..." />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
            বার্তা পাঠান
          </button>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-gray-400">
        সরাসরি ইমেইল: <a href="mailto:hello@banglaAIhub.com" className="text-blue-600 hover:underline">hello@banglaAIhub.com</a>
      </div>
    </div>
  )
}
