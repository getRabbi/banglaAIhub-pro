import Link from "next/link";

const FOOTER_LINKS = [
  {
    title: "কনটেন্ট",
    links: [
      { href: "/tools", label: "AI টুলস" },
      { href: "/blog", label: "ব্লগ" },
      { href: "/guides", label: "গাইড" },
      { href: "/top-lists", label: "টপ লিস্ট" },
      { href: "/compare", label: "তুলনা" },
    ],
  },
  {
    title: "রিসোর্স",
    links: [
      { href: "/make-money", label: "অনলাইন আয়" },
      { href: "/deals", label: "ডিলস" },
      { href: "/prompts", label: "প্রম্পট লাইব্রেরি" },
      { href: "/glossary", label: "AI শব্দকোষ" },
      { href: "/resources", label: "ফ্রি রিসোর্স" },
    ],
  },
  {
    title: "অন্যান্য",
    links: [
      { href: "/about", label: "আমাদের সম্পর্কে" },
      { href: "/contact", label: "যোগাযোগ" },
      { href: "/privacy", label: "প্রাইভেসি পলিসি" },
      { href: "/disclaimer", label: "ডিসক্লেইমার" },
      { href: "/feed.xml", label: "RSS ফিড" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="border-t border-brand-border bg-brand-dark">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🤖</span>
              <span className="font-display font-bold text-lg text-white">
                Bangla<span className="text-brand-electric">AI</span>Hub
              </span>
            </Link>
            <p className="text-sm text-gray-500 leading-relaxed">
              বাংলায় সেরা AI টুলস ডিরেক্টরি এবং অনলাইন আয়ের সম্পূর্ণ গাইড।
            </p>
          </div>

          {FOOTER_LINKS.map((section) => (
            <div key={section.title}>
              <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">{section.title}</h4>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Affiliate disclosure */}
        <div className="mt-10 pt-6 border-t border-brand-border">
          <p className="text-xs text-gray-600 text-center">
            ⚠️ এই সাইটে affiliate link আছে। আপনি যদি এই লিংকের মাধ্যমে কোনো প্রোডাক্ট কেনেন, আমরা একটি কমিশন পেতে পারি — আপনার কোনো অতিরিক্ত খরচ হবে না।
          </p>
          <p className="text-xs text-gray-700 text-center mt-2">
            © {new Date().getFullYear()} BanglaAIHub। সর্বস্বত্ব সংরক্ষিত।
          </p>
        </div>
      </div>
    </footer>
  );
}
