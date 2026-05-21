import { Metadata } from "next";
export const metadata: Metadata = { title: "প্রাইভেসি পলিসি" };
export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-6">🔒 প্রাইভেসি পলিসি</h1>
      <div className="prose prose-invert max-w-none space-y-4 text-gray-300">
        <p>সর্বশেষ আপডেট: {new Date().toLocaleDateString("bn-BD")}</p>
        <h2 className="text-xl font-bold text-white">তথ্য সংগ্রহ</h2>
        <p>আমরা আপনার ব্রাউজিং তথ্য (পেজ ভিউ, ক্লিক) এনালিটিক্সের জন্য সংগ্রহ করি। নিউজলেটারে সাবস্ক্রাইব করলে আপনার ইমেইল সংরক্ষণ করি।</p>
        <h2 className="text-xl font-bold text-white">কুকিজ</h2>
        <p>আমাদের সাইটে কুকিজ ব্যবহার করা হয় আপনার ব্রাউজিং অভিজ্ঞতা উন্নত করতে।</p>
        <h2 className="text-xl font-bold text-white">Affiliate Links</h2>
        <p>আমাদের সাইটে affiliate link আছে। আপনি এই লিংকের মাধ্যমে কিছু কিনলে আমরা কমিশন পেতে পারি। এতে আপনার কোনো অতিরিক্ত খরচ হয় না।</p>
        <h2 className="text-xl font-bold text-white">তথ্য শেয়ারিং</h2>
        <p>আমরা আপনার ব্যক্তিগত তথ্য তৃতীয় পক্ষের কাছে বিক্রি করি না।</p>
        <h2 className="text-xl font-bold text-white">যোগাযোগ</h2>
        <p>প্রাইভেসি সংক্রান্ত প্রশ্নে আমাদের <a href="/contact" className="text-brand-electric hover:underline">যোগাযোগ পেজে</a> মেসেজ পাঠান।</p>
      </div>
    </div>
  );
}
