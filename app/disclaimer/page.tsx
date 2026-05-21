import { Metadata } from "next";
export const metadata: Metadata = { title: "ডিসক্লেইমার" };
export default function DisclaimerPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">⚠️ ডিসক্লেইমার</h1>
      <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
        <h2 className="text-xl font-bold text-white">Affiliate Disclosure</h2>
        <p>BanglaAIHub affiliate link ব্যবহার করে। আমাদের সাইটের লিংকের মাধ্যমে আপনি যদি কোনো প্রোডাক্ট বা সার্ভিস কেনেন, আমরা একটি কমিশন পেতে পারি। এতে আপনার কোনো অতিরিক্ত খরচ হবে না।</p>
        <h2 className="text-xl font-bold text-white">কনটেন্ট</h2>
        <p>আমাদের রিভিউ এবং গাইড তথ্যমূলক উদ্দেশ্যে তৈরি। আমরা সর্বোচ্চ সঠিকতার চেষ্টা করি, তবে প্রতিটি AI টুলের ফিচার, মূল্য এবং নীতি পরিবর্তন হতে পারে।</p>
        <h2 className="text-xl font-bold text-white">আয়ের গ্যারান্টি</h2>
        <p>অনলাইন আয় সম্পর্কিত আমাদের গাইড শিক্ষামূলক। আয়ের পরিমাণ ব্যক্তি থেকে ব্যক্তিতে ভিন্ন হবে এবং আমরা কোনো নির্দিষ্ট আয়ের গ্যারান্টি দিই না।</p>
        <h2 className="text-xl font-bold text-white">AI Generated Content</h2>
        <p>আমাদের কিছু কনটেন্ট AI এর সাহায্যে তৈরি এবং মানুষ দ্বারা পর্যালোচিত। আমরা গুণমান নিশ্চিত করতে সর্বোচ্চ চেষ্টা করি।</p>
      </div>
    </div>
  );
}
