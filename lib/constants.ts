export const SITE = {
  name: "BanglaAIHub",
  url: process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com",
  description: "বাংলায় সেরা AI টুলস ডিরেক্টরি — অনলাইন আয়, AI টুলস রিভিউ, টেক গাইড",
  fb: "https://facebook.com/BanglaAIHub",
};

export const BLOG_CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  "money-making": { label: "অনলাইন আয়", emoji: "💰", color: "emerald" },
  "ai-tools": { label: "AI টুলস", emoji: "🤖", color: "violet" },
  "tech-news": { label: "টেক নিউজ", emoji: "📡", color: "blue" },
  "product-review": { label: "প্রোডাক্ট রিভিউ", emoji: "🚀", color: "amber" },
};

export const PRICING_LABELS: Record<string, { label: string; color: string }> = {
  free: { label: "ফ্রি", color: "emerald" },
  freemium: { label: "ফ্রিমিয়াম", color: "blue" },
  paid: { label: "পেইড", color: "orange" },
  enterprise: { label: "এন্টারপ্রাইজ", color: "purple" },
};

export const BADGE_LABELS: Record<string, { label: string; emoji: string; icon: string }> = {
  editors_choice: { label: "সম্পাদকের পছন্দ", emoji: "⭐", icon: "⭐" },
  "editors-choice": { label: "সম্পাদকের পছন্দ", emoji: "⭐", icon: "⭐" },
  trending: { label: "ট্রেন্ডিং", emoji: "🔥", icon: "🔥" },
  new: { label: "নতুন", emoji: "✨", icon: "✨" },
  popular: { label: "জনপ্রিয়", emoji: "❤️", icon: "❤️" },
  best_value: { label: "সেরা মূল্য", emoji: "💎", icon: "💎" },
  "best-value": { label: "সেরা মূল্য", emoji: "💎", icon: "💎" },
};

export const SOURCE_LABELS: Record<string, string> = {
  reddit: "Reddit", x: "X/Twitter", hackernews: "Hacker News", producthunt: "Product Hunt", manual: "BanglaAIHub",
};

export const SOURCE_MAP = SOURCE_LABELS;

export function formatBnDate(date: string) {
  return new Date(date).toLocaleDateString("bn-BD", { year: "numeric", month: "long", day: "numeric" });
}

export function formatBnDateShort(date: string) {
  return new Date(date).toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
}

export const formatBanglaDate = formatBnDate;
export const formatBanglaDateShort = formatBnDateShort;

export function estimateReadTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).length / 180));
}

// Simple markdown to HTML
export function mdToHtml(md: string): string {
  return md
    .replace(/^### (.+)$/gm, "<h3>$1</h3>")
    .replace(/^## (.+)$/gm, "<h2>$1</h2>")
    .replace(/^# (.+)$/gm, "<h1>$1</h1>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/^> (.+)$/gm, "<blockquote>$1</blockquote>")
    .replace(/^- (.+)$/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => `<ul>${m}</ul>`)
    .split("\n\n")
    .map((p) => (p.startsWith("<h") || p.startsWith("<ul") || p.startsWith("<blockquote") ? p : `<p>${p.replace(/\n/g, "<br/>")}</p>`))
    .join("\n");
}

export const formatMarkdown = mdToHtml;
