import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI শব্দকোষ - BanglaAIHub',
  description: 'AI ও machine learning-এর গুরুত্বপূর্ণ terms বাংলায় সহজ ভাষায়।',
}
export const revalidate = 86400

export default async function GlossaryPage() {
  const supabase = createClient()
  const { data: terms } = await supabase.from('glossary_terms').select('*').order('term_en')

  const grouped: Record<string, typeof terms> = {}
  terms?.forEach(term => {
    const letter = term.term_en[0].toUpperCase()
    if (!grouped[letter]) grouped[letter] = []
    grouped[letter]!.push(term)
  })

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI শব্দকোষ</h1>
        <p className="text-gray-500 dark:text-gray-400">AI ও machine learning-এর গুরুত্বপূর্ণ terms বাংলায় সহজ ভাষায়</p>
      </div>

      {/* Alphabet navigation */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.keys(grouped).sort().map(letter => (
          <a key={letter} href={`#letter-${letter}`}
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-600 hover:text-white transition-colors font-medium text-sm">
            {letter}
          </a>
        ))}
      </div>

      {/* Terms */}
      <div className="space-y-8">
        {Object.keys(grouped).sort().map(letter => (
          <div key={letter} id={`letter-${letter}`}>
            <h2 className="text-2xl font-bold text-blue-600 mb-4 pb-2 border-b border-gray-200 dark:border-gray-800">{letter}</h2>
            <div className="space-y-4">
              {grouped[letter]!.map(term => (
                <div key={term.id} className="card p-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{term.term_en}</h3>
                        {term.term_bn && <span className="text-gray-500 dark:text-gray-400 text-sm">({term.term_bn})</span>}
                      </div>
                      <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{term.definition_bn}</p>
                      {term.example_bn && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 italic">উদাহরণ: {term.example_bn}</p>
                      )}
                      {term.related_terms?.length > 0 && (
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className="text-xs text-gray-400">সম্পর্কিত:</span>
                          {term.related_terms.map((t: string) => (
                            <span key={t} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">{t}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
        {Object.keys(grouped).length === 0 && (
          <p className="text-center py-10 text-gray-500">শব্দকোষ শীঘ্রই আসছে</p>
        )}
      </div>
    </div>
  )
}
