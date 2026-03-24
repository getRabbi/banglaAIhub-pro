// Privacy Policy Page
import type { Metadata } from 'next'
export const metadata: Metadata = { title: 'প্রাইভেসি পলিসি - BanglaAIHub' }

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">প্রাইভেসি পলিসি</h1>
      <div className="prose-bangla space-y-6 text-gray-700 dark:text-gray-300">
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">তথ্য সংগ্রহ</h2>
          <p>BanglaAIHub আপনার ব্যক্তিগত তথ্য সংগ্রহ করে না। আমরা শুধুমাত্র নিউজলেটার সাবস্ক্রিপশনের জন্য ইমেইল সংরক্ষণ করি।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">কুকিজ</h2>
          <p>আমরা আপনার থিম পছন্দ (light/dark) ও সম্প্রতি দেখা টুলস সংরক্ষণের জন্য local storage ব্যবহার করি। কোনো ট্র্যাকিং কুকি নেই।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">Affiliate Links</h2>
          <p>আমাদের সাইটে affiliate links থাকতে পারে। এগুলো ব্যবহার করলে আমরা কমিশন পাই — আপনার কোনো অতিরিক্ত খরচ হয় না।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">তৃতীয় পক্ষের সেবা</h2>
          <p>আমরা Supabase (database), Vercel (hosting), এবং Unsplash (images) ব্যবহার করি। এদের নিজস্ব প্রাইভেসি পলিসি আছে।</p>
        </section>
        <section>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-3">যোগাযোগ</h2>
          <p>প্রাইভেসি সংক্রান্ত প্রশ্নের জন্য: <a href="mailto:hello@banglaAIhub.com" className="text-blue-600 hover:underline">hello@banglaAIhub.com</a></p>
        </section>
      </div>
    </div>
  )
}
