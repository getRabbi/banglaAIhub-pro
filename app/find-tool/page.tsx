"use client";
import { useState } from "react";
import Link from "next/link";

const QUESTIONS = [
  { id: "purpose", q: "আপনি কী করতে চান?", options: ["লেখালেখি", "ইমেজ তৈরি", "ভিডিও এডিটিং", "কোডিং", "মার্কেটিং", "ডাটা এনালাইসিস", "চ্যাটবট", "অন্যান্য"] },
  { id: "budget", q: "বাজেট কত?", options: ["সম্পূর্ণ ফ্রি", "মাসে $10 এর কম", "মাসে $10-50", "যেকোনো বাজেট"] },
  { id: "skill", q: "টেকনিক্যাল স্কিল লেভেল?", options: ["নতুন (বিগিনার)", "মোটামুটি জানি", "এক্সপার্ট"] },
];

export default function FindToolPage() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const handleSelect = (id: string, val: string) => {
    const next = { ...answers, [id]: val };
    setAnswers(next);
    if (step < QUESTIONS.length - 1) setStep(step + 1);
    else setDone(true);
  };

  const getRecommendation = () => {
    const p = answers.purpose || "";
    let q = p;
    if (answers.budget === "সম্পূর্ণ ফ্রি") q += " free";
    return q;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-extrabold text-white mb-2 text-center">🔍 AI টুল ফাইন্ডার</h1>
      <p className="text-gray-400 mb-10 text-center">কয়েকটা প্রশ্নের উত্তর দিন — আমরা সেরা টুল সাজেস্ট করবো</p>

      {!done ? (
        <div className="glass-card p-8 animate-fade-in">
          <p className="text-sm text-gray-500 mb-2">প্রশ্ন {step + 1}/{QUESTIONS.length}</p>
          <div className="w-full bg-brand-border rounded-full h-1.5 mb-6"><div className="bg-brand-blue h-1.5 rounded-full transition-all" style={{ width: `${((step + 1) / QUESTIONS.length) * 100}%` }} /></div>
          <h2 className="text-xl font-bold text-white mb-6">{QUESTIONS[step].q}</h2>
          <div className="grid grid-cols-2 gap-3">
            {QUESTIONS[step].options.map((opt) => (
              <button key={opt} onClick={() => handleSelect(QUESTIONS[step].id, opt)} className="glass-card card-hover p-4 text-left text-gray-300 hover:text-white font-medium transition-all">
                {opt}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="glass-card p-8 text-center animate-fade-in">
          <p className="text-4xl mb-4">✅</p>
          <h2 className="text-xl font-bold text-white mb-4">আপনার জন্য সেরা টুলস খুঁজছি...</h2>
          <p className="text-gray-400 mb-6">
            আপনি চান: <span className="text-white font-medium">{answers.purpose}</span> · 
            বাজেট: <span className="text-white font-medium">{answers.budget}</span> · 
            লেভেল: <span className="text-white font-medium">{answers.skill}</span>
          </p>
          <Link href={`/search?q=${encodeURIComponent(getRecommendation())}`} className="btn-primary inline-block">🔍 টুলস দেখুন</Link>
          <button onClick={() => { setStep(0); setAnswers({}); setDone(false); }} className="btn-secondary ml-3">আবার শুরু করুন</button>
        </div>
      )}
    </div>
  );
}
