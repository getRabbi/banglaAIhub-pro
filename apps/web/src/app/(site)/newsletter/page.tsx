'use client'
import { useState } from 'react'
import { Mail, CheckCircle, Loader2 } from 'lucide-react'

export default function NewsletterPage() {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (e: any) { setError(e.message) }
    setLoading(false)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-16 text-center">
      <div className="text-5xl mb-6">📬</div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">BanglaAI Weekly</h1>
      <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
        প্রতি সপ্তাহে সেরা AI টুলস, deals ও tips সরাসরি ইমেইলে পাবেন
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        {['🆕 নতুন AI টুলস', '💰 সেরা deals', '📖 Bangla গাইড'].map(item => (
          <div key={item} className="card p-4 text-center text-sm font-medium text-gray-700 dark:text-gray-300">{item}</div>
        ))}
      </div>

      {done ? (
        <div className="card p-8 flex flex-col items-center gap-3">
          <CheckCircle className="w-12 h-12 text-green-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">সাবস্ক্রাইব সফল!</h2>
          <p className="text-gray-500">আপনাকে স্বাগতম! প্রতি সপ্তাহে আপডেট পাবেন।</p>
        </div>
      ) : (
        <form onSubmit={submit} className="card p-6 text-left space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">নাম (optional)</label>
            <input type="text" className="input" value={name} onChange={e => setName(e.target.value)} placeholder="আপনার নাম" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">ইমেইল *</label>
            <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <button type="submit" disabled={loading}
            className="btn-primary w-full justify-center py-3">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Mail className="w-5 h-5" />}
            সাবস্ক্রাইব করুন — বিনামূল্যে
          </button>
          <p className="text-xs text-gray-400 text-center">স্প্যাম নেই। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।</p>
        </form>
      )}
    </div>
  )
}
