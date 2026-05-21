import Link from "next/link";
export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-8xl font-black text-white/5 mb-4">404</p>
        <h1 className="text-2xl font-bold text-white mb-2">পেজটি পাওয়া যায়নি</h1>
        <p className="text-gray-400 mb-6">আপনি যে পেজটি খুঁজছেন সেটি সরিয়ে ফেলা হয়েছে বা এর ঠিকানা পরিবর্তিত হয়েছে।</p>
        <div className="flex gap-3 justify-center">
          <Link href="/" className="btn-primary">হোমপেজে যান</Link>
          <Link href="/tools" className="btn-secondary">টুলস দেখুন</Link>
        </div>
      </div>
    </div>
  );
}
