import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'ডিসক্লেইমার - BanglaAIHub' }

export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">ডিসক্লেইমার</h1>
      <div className="space-y-6 text-gray-700 dark:text-gray-300">
        <div className="p-5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
          <h2 className="text-lg font-bold text-amber-800 dark:text-amber-300 mb-2">⚠️ Affiliate Disclosure</h2>
          <p className="text-amber-700 dark:text-amber-400">BanglaAIHub একটি affiliate marketing website। আমাদের পোস্টে থাকা কিছু লিংকে ক্লিক করে কেনাকাটা করলে আমরা কমিশন পাই। এতে আপনার কোনো অতিরিক্ত খরচ হয় না।</p>
        </div>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">মতামত ও রিভিউ</h2>
          <p>আমাদের সকল রিভিউ ও মতামত সৎ এবং স্বাধীন। কমিশন পাওয়া সত্ত্বেও আমরা নিরপেক্ষভাবে টুলস মূল্যায়ন করি।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">তথ্যের যথার্থতা</h2>
          <p>আমরা সঠিক তথ্য প্রদানের চেষ্টা করি, তবে AI tools-এর pricing ও features সময়ের সাথে পরিবর্তন হতে পারে। সর্বশেষ তথ্যের জন্য অফিসিয়াল সাইট দেখুন।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">আয়ের দাবি</h2>
          <p>&ldquo;আয় করুন&rdquo; section-এর তথ্য শিক্ষামূলক। প্রকৃত আয় ব্যক্তি, প্রচেষ্টা ও বাজারের উপর নির্ভর করে।</p>
        </section>
      </div>
    </div>
  )
}
