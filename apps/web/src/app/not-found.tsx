import Link from 'next/link'
import { Home, Search, ArrowRight } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-950 px-4">
      <div className="text-center max-w-md">
        <div className="text-8xl font-bold text-gradient mb-4">৪০৪</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">পেজটি পাওয়া যায়নি</h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8">
          আপনি যে পেজটি খুঁজছেন সেটি সরানো হয়েছে বা এখানে কোনোদিন ছিল না।
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            <Home className="w-4 h-4" /> হোমপেজে যান
          </Link>
          <Link href="/tools" className="btn-secondary">
            <Search className="w-4 h-4" /> AI টুলস দেখুন
          </Link>
        </div>
        <div className="mt-10">
          <p className="text-sm text-gray-400 mb-4">জনপ্রিয় পেজ:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { label: 'সব টুলস', href: '/tools' },
              { label: 'তুলনা', href: '/compare' },
              { label: 'গাইড', href: '/guides' },
              { label: 'আয় করুন', href: '/make-money' },
            ].map(l => (
              <Link key={l.href} href={l.href}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700">
                {l.label} <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
