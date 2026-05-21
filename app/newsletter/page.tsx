import { Metadata } from "next";
export const metadata: Metadata = { title: "নিউজলেটার" };
export default function NewsletterPage() {
  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 text-center">
      <span className="text-6xl block mb-6">📬</span>
      <h1 className="text-3xl font-extrabold text-white mb-4">সাপ্তাহিক AI আপডেট</h1>
      <p className="text-gray-400 mb-8">প্রতি সপ্তাহে সেরা AI টুলস, ডিলস এবং আয়ের টিপস সরাসরি আপনার ইনবক্সে।</p>
      <form className="space-y-4">
        <input type="text" placeholder="আপনার নাম" className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50" />
        <input type="email" placeholder="আপনার ইমেইল" required className="w-full px-4 py-3 rounded-xl bg-brand-card border border-brand-border text-white placeholder:text-gray-500 focus:outline-none focus:border-brand-blue/50" />
        <button type="submit" className="btn-primary w-full">সাবস্ক্রাইব করুন</button>
      </form>
      <p className="text-xs text-gray-600 mt-4">আমরা স্প্যাম করি না। যেকোনো সময় আনসাবস্ক্রাইব করতে পারবেন।</p>
    </div>
  );
}
