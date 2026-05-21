import { Metadata } from "next";
export const metadata: Metadata = { title: "যোগাযোগ" };
export default function ContactPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">📧 যোগাযোগ</h1>
      <p className="text-gray-400 mb-8">প্রশ্ন, পরামর্শ বা বিজনেস inquiry — আমাদের মেসেজ পাঠান।</p>
      <form className="space-y-4">
        <input type="text" placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50" />
        <input type="email" placeholder="আপনার ইমেইল" required className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50" />
        <select className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-gray-400 focus:outline-none focus:border-brand-blue/50">
          <option>বিষয় নির্বাচন করুন</option>
          <option>সাধারণ প্রশ্ন</option>
          <option>টুল রিভিউ অনুরোধ</option>
          <option>বিজনেস / স্পনসরশিপ</option>
          <option>বাগ রিপোর্ট</option>
        </select>
        <textarea placeholder="আপনার মেসেজ" rows={5} className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50 resize-none" />
        <button type="submit" className="btn-primary w-full">পাঠান</button>
      </form>
    </div>
  );
}
