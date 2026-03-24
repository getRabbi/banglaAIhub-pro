'use client'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/newsletter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      setDone(true)
    } catch (e: any) {
      setError('সাবস্ক্রাইব ব্যর্থ হয়েছে। আবার চেষ্টা করুন।')
    }
    setLoading(false)
  }

  if (done) {
    return (
      <div className="max-w-lg mx-auto py-3">
        <p className="text-white font-semibold text-lg">✅ সাবস্ক্রাইব সফল হয়েছে!</p>
      </div>
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-3 max-w-lg mx-auto"
    >
      <input
        type="email"
        required
        value={email}
        onChange={e => setEmail(e.target.value)}
        placeholder="আপনার ইমেইল দিন"
        className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
      />
      <button
        type="submit"
        disabled={loading}
        className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-xl hover:bg-blue-50 transition-colors whitespace-nowrap flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        সাবস্ক্রাইব করুন
      </button>
      {error && <p className="text-red-300 text-sm w-full text-center">{error}</p>}
    </form>
  )
}
