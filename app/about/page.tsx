import { Metadata } from "next";
import Link from "next/link";
export const metadata: Metadata = { title: "আমাদের সম্পর্কে" };
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">🤖 BanglaAIHub সম্পর্কে</h1>
      <div className="space-y-4 text-gray-300 leading-relaxed">
        <p>BanglaAIHub হলো বাংলা ভাষায় প্রথম সম্পূর্ণ AI টুলস ডিরেক্টরি ও রিসোর্স প্ল্যাটফর্ম।</p>
        <p>আমাদের লক্ষ্য বাংলাভাষী মানুষদের AI টুলস সম্পর্কে জানানো এবং অনলাইনে আয়ের সুযোগ তৈরি করা।</p>
        <h2 className="text-xl font-bold text-white pt-4">আমরা কী অফার করি</h2>
        <ul className="space-y-2">
          <li>✅ ৫০০+ AI টুলসের বিস্তারিত রিভিউ</li>
          <li>✅ অনলাইন আয়ের practical গাইড</li>
          <li>✅ AI টুলস তুলনা ও টপ লিস্ট</li>
          <li>✅ সেরা ডিলস ও কুপন</li>
          <li>✅ ফ্রি প্রম্পট লাইব্রেরি</li>
          <li>✅ বাংলা AI শব্দকোষ</li>
        </ul>
        <h2 className="text-xl font-bold text-white pt-4">যোগাযোগ</h2>
        <p>যেকোনো প্রশ্ন বা পরামর্শের জন্য আমাদের <Link href="/contact" className="text-brand-electric hover:underline">যোগাযোগ পেজে</Link> মেসেজ পাঠান।</p>
      </div>
    </div>
  );
}
