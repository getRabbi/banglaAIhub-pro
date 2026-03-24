import Link from 'next/link'
import { Download, ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'ফ্রি AI রিসোর্স - BanglaAIHub',
  description: 'ফ্রি AI prompts, workflow templates, cheatsheets ও learning roadmap।',
}

const RESOURCES = [
  { icon: '📝', title: 'ChatGPT Prompt Pack', desc: '১০০+ বাংলা ChatGPT prompts — business, freelancing, content সহ', href: '/prompts', badge: 'ফ্রি', count: '100+ prompts' },
  { icon: '⚡', title: 'AI Workflow Templates', desc: 'Blogging, YouTube, freelancing-এর জন্য step-by-step workflows', href: '/resources/workflows', badge: 'ফ্রি', count: '20+ templates' },
  { icon: '🗺️', title: 'AI Learning Roadmap', desc: 'শুরু থেকে expert পর্যন্ত — বাংলায় AI শেখার পূর্ণ গাইড', href: '/guides', badge: 'ফ্রি', count: 'Complete guide' },
  { icon: '🆓', title: 'ফ্রি AI টুলস লিস্ট', desc: '২০০+ সম্পূর্ণ ফ্রি AI টুলসের তালিকা — কোনো ক্রেডিট কার্ড নেই', href: '/top-lists/best-free-ai-tools', badge: 'ফ্রি', count: '200+ tools' },
  { icon: '📊', title: 'AI Comparison Sheets', desc: 'ChatGPT vs Claude vs Gemini — সব comparison একসাথে', href: '/compare', badge: 'ফ্রি', count: 'Multiple sheets' },
  { icon: '💡', title: 'Midjourney Prompt Guide', desc: 'সেরা Midjourney prompts ও tips বাংলায়', href: '/prompts?category=midjourney', badge: 'ফ্রি', count: '50+ prompts' },
]

export default function ResourcesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Download className="w-5 h-5 text-green-500" />
          <span className="text-sm font-medium text-green-500">সম্পূর্ণ বিনামূল্যে</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">ফ্রি AI রিসোর্স</h1>
        <p className="text-gray-500 dark:text-gray-400">AI দিয়ে দ্রুত এগিয়ে যেতে সাহায্য করার জন্য আমাদের ফ্রি resources</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {RESOURCES.map(r => (
          <Link key={r.href} href={r.href} className="group card-hover p-6 flex flex-col gap-4">
            <div className="flex items-start gap-3">
              <span className="text-3xl">{r.icon}</span>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors">{r.title}</h2>
                  <span className="badge-free">{r.badge}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{r.desc}</p>
              </div>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800">
              <span className="text-xs text-gray-400">{r.count}</span>
              <div className="flex items-center gap-1 text-sm text-blue-600 font-medium">
                দেখুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Newsletter CTA */}
      <div className="mt-12 card p-8 text-center bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border-blue-200 dark:border-blue-800">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">আরো ফ্রি রিসোর্স পেতে</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-4">Newsletter সাবস্ক্রাইব করুন — প্রতি সপ্তাহে নতুন ফ্রি resources পাবেন</p>
        <Link href="/newsletter" className="btn-primary">নিউজলেটার সাবস্ক্রাইব করুন</Link>
      </div>
    </div>
  )
}
