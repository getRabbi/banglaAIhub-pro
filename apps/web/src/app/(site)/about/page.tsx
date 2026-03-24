import Link from 'next/link'
import { Zap, Target, Heart, Rocket } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'আমাদের সম্পর্কে - BanglaAIHub' }

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Zap className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">BanglaAIHub সম্পর্কে</h1>
        <p className="text-xl text-gray-500 dark:text-gray-400 max-w-2xl mx-auto leading-relaxed">
          বাংলাভাষী মানুষদের জন্য সবচেয়ে বিশ্বস্ত AI tools directory, guide এবং resource platform।
        </p>
      </div>

      {/* Mission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
        {[
          { icon: Target, title: 'আমাদের লক্ষ্য', color: 'blue', desc: 'AI এর সুবিধা বাংলাভাষী সবার কাছে পৌঁছে দেওয়া। ভাষার বাধা দূর করে সবাইকে AI-powered ভবিষ্যতের জন্য প্রস্তুত করা।' },
          { icon: Heart, title: 'কেন BanglaAIHub?', color: 'red', desc: 'আমরা বিশ্বাস করি জ্ঞান ভাগ করে নিলে সবাই এগিয়ে যায়। তাই সব AI গাইড, রিভিউ ও টিপস সম্পূর্ণ বাংলায়।' },
          { icon: Rocket, title: 'কী পাবেন?', color: 'purple', desc: '৫০০+ AI টুলসের বাংলা রিভিউ, তুলনা, গাইড, এবং AI দিয়ে আয় করার বাস্তব কৌশল।' },
          { icon: Zap, title: 'নিয়মিত আপডেট', color: 'orange', desc: 'প্রতিদিন নতুন AI টুলস, deals এবং গাইড যুক্ত হয়। নিউজলেটার সাবস্ক্রাইব করে সর্বশেষ আপডেট পান।' },
        ].map(({ icon: Icon, title, color, desc }) => (
          <div key={title} className="card p-6">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/30' : color === 'red' ? 'bg-red-100 dark:bg-red-900/30' : color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
              <Icon className={`w-5 h-5 ${color === 'blue' ? 'text-blue-600' : color === 'red' ? 'text-red-600' : color === 'purple' ? 'text-purple-600' : 'text-orange-600'}`} />
            </div>
            <h2 className="font-bold text-gray-900 dark:text-white mb-2">{title}</h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-2xl p-8 text-white text-center mb-16">
        <h2 className="text-2xl font-bold mb-6">BanglaAIHub-এ কী আছে?</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[['৫০০+', 'AI টুলস'], ['১৫+', 'ক্যাটাগরি'], ['১০০+', 'বাংলা গাইড'], ['ফ্রি', 'সবসময়']].map(([val, label]) => (
            <div key={label}>
              <div className="text-3xl font-bold mb-1">{val}</div>
              <div className="text-blue-200 text-sm">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">শুরু করুন আজই</h2>
        <p className="text-gray-500 mb-6">AI দিয়ে আপনার জীবন ও ক্যারিয়ার পরিবর্তন করুন</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/tools" className="btn-primary">AI টুলস দেখুন</Link>
          <Link href="/guides" className="btn-secondary">গাইড পড়ুন</Link>
          <Link href="/newsletter" className="btn-outline">নিউজলেটার সাবস্ক্রাইব</Link>
        </div>
      </div>
    </div>
  )
}
