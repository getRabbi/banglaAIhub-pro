// MakeMoneySection.tsx
import Link from 'next/link'
import { ArrowRight, DollarSign } from 'lucide-react'

const MONEY_TOPICS = [
  { icon: '💼', title: 'AI দিয়ে ফ্রিল্যান্সিং', desc: 'Fiverr ও Upwork-এ AI ব্যবহার করে আয় করুন', href: '/make-money/freelancing', color: 'blue' },
  { icon: '📺', title: 'YouTube অটোমেশন', desc: 'AI দিয়ে YouTube চ্যানেল চালান অটোমেটিক', href: '/make-money/youtube', color: 'red' },
  { icon: '🔗', title: 'অ্যাফিলিয়েট মার্কেটিং', desc: 'AI টুলস প্রমোট করে কমিশন আয় করুন', href: '/make-money/affiliate', color: 'green' },
  { icon: '⚡', title: 'পাসিভ ইনকাম', desc: 'AI দিয়ে স্বয়ংক্রিয় আয়ের সিস্টেম বানান', href: '/make-money/passive-income', color: 'purple' },
]

export function MakeMoneySection() {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <DollarSign className="w-5 h-5 text-green-500" />
              <span className="text-sm font-medium text-green-500">আয় করুন</span>
            </div>
            <h2 className="section-title">AI দিয়ে অনলাইনে আয়</h2>
            <p className="section-subtitle">বাস্তব কৌশল যা দিয়ে মানুষ ইতোমধ্যে আয় করছে</p>
          </div>
          <Link href="/make-money" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
            সব দেখুন <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MONEY_TOPICS.map((item) => (
            <Link key={item.href} href={item.href}
              className="group card-hover p-6 flex flex-col gap-3"
            >
              <span className="text-3xl">{item.icon}</span>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 transition-colors mb-1">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">{item.desc}</p>
              </div>
              <div className="flex items-center gap-1 text-sm text-blue-600 font-medium mt-auto">
                পড়ুন <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

export default MakeMoneySection
