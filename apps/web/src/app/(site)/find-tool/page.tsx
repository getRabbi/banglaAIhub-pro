'use client'
import { useState } from 'react'
import { Sparkles, Loader2, ArrowRight, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const QUESTIONS = [
  { id: 'goal', question: 'আপনি কী করতে চান?', options: ['কনটেন্ট লিখতে চাই', 'ছবি বানাতে চাই', 'ভিডিও তৈরি করতে চাই', 'কোড লিখতে সাহায্য চাই', 'ব্যবসা অটোমেট করতে চাই', 'আয় করতে চাই'] },
  { id: 'level', question: 'আপনার অভিজ্ঞতা কেমন?', options: ['একদম নতুন', 'কিছুটা জানি', 'অভিজ্ঞ'] },
  { id: 'budget', question: 'বাজেট কেমন?', options: ['সম্পূর্ণ ফ্রি চাই', 'অল্প টাকা দিতে পারব', 'ভালো টুলে বিনিয়োগ করতে রাজি'] },
  { id: 'use', question: 'কোন কাজে ব্যবহার করবেন?', options: ['ব্যক্তিগত', 'ফ্রিল্যান্সিং', 'ব্যবসা', 'পড়াশোনা'] },
]

interface Result {
  tools: { name: string; slug: string; why: string; pricing: string }[]
  summary: string
}

export default function FindToolPage() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<Result | null>(null)

  const answer = async (value: string) => {
    const q = QUESTIONS[step]
    const newAnswers = { ...answers, [q.id]: value }
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(s => s + 1)
    } else {
      // All answered — get recommendations
      setLoading(true)
      try {
        const res = await fetch('/api/find-tool', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ answers: newAnswers }),
        })
        const data = await res.json()
        setResult(data)
      } catch {
        setResult({
          summary: 'কিছু সমস্যা হয়েছে। নিচের টুলসগুলো দেখুন।',
          tools: [
            { name: 'ChatGPT', slug: 'chatgpt', why: 'সবচেয়ে জনপ্রিয় AI assistant', pricing: 'ফ্রি + পেইড' },
            { name: 'Canva AI', slug: 'canva', why: 'Design ও ছবির জন্য সহজ', pricing: 'ফ্রি + পেইড' },
            { name: 'Midjourney', slug: 'midjourney', why: 'সেরা image generator', pricing: 'পেইড' },
          ]
        })
      }
      setLoading(false)
    }
  }

  const reset = () => { setStep(0); setAnswers({}); setResult(null) }

  const currentQ = QUESTIONS[step]
  const progress = ((step) / QUESTIONS.length) * 100

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center mx-auto mb-4">
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI টুল ফাইন্ডার</h1>
        <p className="text-gray-500 dark:text-gray-400">কয়েকটি প্রশ্নের উত্তর দিন — আমরা আপনার জন্য সেরা AI টুলস বেছে দেব</p>
      </div>

      {!result && !loading && (
        <div className="card p-8">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between text-xs text-gray-400 mb-2">
              <span>প্রশ্ন {step + 1}/{QUESTIONS.length}</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-600 to-purple-600 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6 text-center">{currentQ.question}</h2>
          <div className="grid grid-cols-1 gap-3">
            {currentQ.options.map(opt => (
              <button key={opt} onClick={() => answer(opt)}
                className="p-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10 text-left font-medium text-gray-700 dark:text-gray-300 transition-all group">
                <div className="flex items-center justify-between">
                  <span>{opt}</span>
                  <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading && (
        <div className="card p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">আপনার জন্য সেরা AI টুলস খুঁজে বের করছি...</p>
        </div>
      )}

      {result && (
        <div className="space-y-4">
          <div className="card p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <span className="font-semibold text-blue-700 dark:text-blue-400">আমাদের সুপারিশ</span>
            </div>
            <p className="text-gray-700 dark:text-gray-300">{result.summary}</p>
          </div>

          {result.tools.map((tool, i) => (
            <div key={tool.slug} className="card-hover p-5 flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                {i + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-gray-900 dark:text-white text-lg">{tool.name}</h3>
                  <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded-full">{tool.pricing}</span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tool.why}</p>
                <Link href={`/tools/${tool.slug}`}
                  className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  বিস্তারিত দেখুন <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}

          <button onClick={reset} className="btn-secondary w-full justify-center">
            <RefreshCw className="w-4 h-4" /> আবার চেষ্টা করুন
          </button>
        </div>
      )}
    </div>
  )
}
