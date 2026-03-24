import Link from 'next/link'
import { Zap, Facebook, Mail } from 'lucide-react'

const FOOTER_LINKS = {
  'AI টুলস': [
    { label: 'সব টুলস', href: '/tools' },
    { label: 'ক্যাটাগরি', href: '/categories' },
    { label: 'তুলনা', href: '/compare' },
    { label: 'টপ লিস্ট', href: '/top-lists' },
    { label: 'ডিলস', href: '/deals' },
  ],
  'রিসোর্স': [
    { label: 'গাইড', href: '/guides' },
    { label: 'ফ্রি রিসোর্স', href: '/resources' },
    { label: 'প্রম্পট লাইব্রেরি', href: '/prompts' },
    { label: 'AI শব্দকোষ', href: '/glossary' },
    { label: 'AI টুল ফাইন্ডার', href: '/find-tool' },
  ],
  'আয় করুন': [
    { label: 'AI দিয়ে আয়', href: '/make-money' },
    { label: 'ফ্রিল্যান্সিং গাইড', href: '/make-money/freelancing' },
    { label: 'পাসিভ ইনকাম', href: '/make-money/passive-income' },
    { label: 'YouTube অটোমেশন', href: '/make-money/youtube' },
    { label: 'অ্যাফিলিয়েট মার্কেটিং', href: '/make-money/affiliate' },
  ],
  'সাইট': [
    { label: 'ব্লগ', href: '/blog' },
    { label: 'নিউজলেটার', href: '/newsletter' },
    { label: 'আমাদের সম্পর্কে', href: '/about' },
    { label: 'যোগাযোগ', href: '/contact' },
    { label: 'প্রাইভেসি পলিসি', href: '/privacy' },
    { label: 'ডিসক্লেইমার', href: '/disclaimer' },
  ],
}

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-display font-bold text-white text-lg">
                <span className="text-blue-500">Bangla</span>AI<span className="text-purple-500">Hub</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed mb-4">
              বাংলায় সবচেয়ে trusted AI tools directory এবং resource platform।
            </p>
            <div className="flex gap-3">
              <a href="https://facebook.com/banglaAIhub" target="_blank" rel="noopener noreferrer"
                className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 transition-colors"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a href="mailto:hello@banglaAIhub.com"
                className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 transition-colors"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="text-white font-semibold text-sm mb-3">{title}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm">© {new Date().getFullYear()} BanglaAIHub. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="text-xs">
            এই সাইটে affiliate links থাকতে পারে।{' '}
            <Link href="/disclaimer" className="underline hover:text-white">বিস্তারিত</Link>
          </p>
        </div>
      </div>
    </footer>
  )
}
