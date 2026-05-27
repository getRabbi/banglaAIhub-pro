export type CuratedDeal = {
  id: string;
  title: string;
  title_bn: string;
  slug: string;
  description_bn: string;
  tool_slug: string;
  tools: { name: string; slug: string; logo_url?: string };
  coupon_code?: string;
  original_price?: string;
  deal_price?: string;
  discount_text?: string;
  discount_text_bn?: string;
  deal_url: string;
  expires_at?: string | null;
  is_active: true;
  is_featured: boolean;
  view_count: number;
  click_count: number;
  created_at: string;
  source_label: string;
  source_url: string;
  highlights_bn: string[];
  best_for_bn: string[];
  caution_bn: string;
};

export const CURATED_DEALS: CuratedDeal[] = [
  {
    id: "curated-deal-chatgpt-free",
    title: "ChatGPT Free Plan Starter Deal",
    title_bn: "ChatGPT Free Plan: লেখালেখি, রিসার্চ ও আইডিয়ার জন্য ফ্রি শুরু",
    slug: "chatgpt-free-plan-starter",
    description_bn:
      "ChatGPT-এর Free plan দিয়ে writing, search, canvas, GPTs discovery, limited file upload, image generation এবং data analysis test করা যায়। যারা AI assistant দিয়ে কাজ শুরু করতে চান, তাদের জন্য paid plan নেওয়ার আগে free workflow benchmark করার ভালো সুযোগ।",
    tool_slug: "chatgpt",
    tools: { name: "ChatGPT", slug: "chatgpt" },
    deal_price: "Free plan",
    discount_text: "৳0 শুরু",
    discount_text_bn: "ফ্রি শুরু",
    deal_url: "https://chatgpt.com/pricing/",
    expires_at: null,
    is_active: true,
    is_featured: true,
    view_count: 0,
    click_count: 0,
    created_at: "2026-05-27T00:00:00+06:00",
    source_label: "OpenAI pricing",
    source_url: "https://chatgpt.com/pricing/",
    highlights_bn: ["Search, Canvas ও GPTs discovery আছে", "Free tier-এ কিছু advanced feature limited", "Paid upgrade করার আগে workflow test করা যায়"],
    best_for_bn: ["Freelancer proposal draft", "Student research outline", "Blog/social content ideation"],
    caution_bn: "Free tier-এর limit ও feature availability সময়ের সাথে বদলাতে পারে, তাই official pricing page দেখে final decision নিন।",
  },
  {
    id: "curated-deal-canva-free-ai",
    title: "Canva Free AI Design Starter",
    title_bn: "Canva Free AI Design: সোশ্যাল পোস্ট ও থাম্বনেইল ফ্রি শুরু",
    slug: "canva-free-ai-design-starter",
    description_bn:
      "Canva Free দিয়ে social post, thumbnail, simple poster, presentation এবং basic AI design workflow শুরু করা যায়। Free plan-এ AI usage allowance থাকে, তাই ছোট business বা creator paid plan নেওয়ার আগে real content workflow test করতে পারেন।",
    tool_slug: "canva-magic-studio",
    tools: { name: "Canva Magic Studio", slug: "canva-magic-studio" },
    deal_price: "Free plan",
    discount_text: "AI allowance",
    discount_text_bn: "AI usage allowance",
    deal_url: "https://www.canva.com/pricing/",
    expires_at: null,
    is_active: true,
    is_featured: true,
    view_count: 0,
    click_count: 0,
    created_at: "2026-05-27T00:00:00+06:00",
    source_label: "Canva pricing",
    source_url: "https://www.canva.com/pricing/",
    highlights_bn: ["Social creative ও presentation workflow easy", "Free plan-এ limited AI usage allowance", "Bangladesh small business marketing-এর জন্য practical"],
    best_for_bn: ["Facebook/Instagram post", "YouTube thumbnail", "Product/event poster"],
    caution_bn: "Premium template, brand kit, higher AI allowance বা team workflow দরকার হলে paid plan compare করুন।",
  },
  {
    id: "curated-deal-github-copilot-free",
    title: "GitHub Copilot Free Developer Deal",
    title_bn: "GitHub Copilot Free: কোডিং assistant ফ্রি শুরু",
    slug: "github-copilot-free-developer-deal",
    description_bn:
      "GitHub Copilot Free individual developer-দের জন্য $0 starter plan দেয়। Official pricing অনুযায়ী Free plan-এ monthly limited chat/agent requests এবং inline completions থাকে, তাই coding assistant paid plan নেওয়ার আগে real project দিয়ে test করা যায়।",
    tool_slug: "github-copilot",
    tools: { name: "GitHub Copilot", slug: "github-copilot" },
    original_price: "Pro paid plan",
    deal_price: "$0 USD",
    discount_text: "Free tier",
    discount_text_bn: "ফ্রি ডেভেলপার টিয়ার",
    deal_url: "https://github.com/features/copilot/plans",
    expires_at: null,
    is_active: true,
    is_featured: true,
    view_count: 0,
    click_count: 0,
    created_at: "2026-05-27T00:00:00+06:00",
    source_label: "GitHub Copilot pricing",
    source_url: "https://github.com/features/copilot/plans",
    highlights_bn: ["$0 individual starter plan", "Monthly limited chat/agent requests", "Monthly inline completion allowance"],
    best_for_bn: ["Student/developer portfolio project", "Bug explain ও code suggestion", "VS Code coding workflow test"],
    caution_bn: "Limit শেষ হলে Pro plan বা reset পর্যন্ত অপেক্ষা লাগতে পারে; team/business feature আলাদা plan-এ থাকে।",
  },
  {
    id: "curated-deal-n8n-community",
    title: "n8n Community Edition Self-host Deal",
    title_bn: "n8n Community Edition: automation self-host করে কম খরচে শুরু",
    slug: "n8n-community-edition-self-host-deal",
    description_bn:
      "n8n Community Edition self-host করলে অনেক automation workflow কম software cost-এ চালানো যায়। Official docs অনুযায়ী Community Edition প্রায় complete feature set দেয়, আর registration করলে কিছু extra community feature unlock করা যায়।",
    tool_slug: "n8n",
    tools: { name: "n8n", slug: "n8n" },
    deal_price: "Self-host option",
    discount_text: "Community edition",
    discount_text_bn: "Community edition",
    deal_url: "https://docs.n8n.io/hosting/community-edition-features/",
    expires_at: null,
    is_active: true,
    is_featured: true,
    view_count: 0,
    click_count: 0,
    created_at: "2026-05-27T00:00:00+06:00",
    source_label: "n8n docs",
    source_url: "https://docs.n8n.io/hosting/community-edition-features/",
    highlights_bn: ["Self-host automation workflow", "Registered community feature unlock", "Lead, report, Telegram alert workflow বানানো যায়"],
    best_for_bn: ["Agency operations", "Facebook lead to CRM flow", "Internal AI summary automation"],
    caution_bn: "Self-host মানে server, backup, security এবং maintenance নিজের দায়িত্বে রাখতে হবে।",
  },
  {
    id: "curated-deal-lovable-free",
    title: "Lovable Free Prototype Starter",
    title_bn: "Lovable Free: MVP ও landing page prototype ফ্রি শুরু",
    slug: "lovable-free-prototype-starter",
    description_bn:
      "Lovable-এর Free plan দিয়ে prompt-to-app workflow test করা যায়। Founder, freelancer বা product designer যারা client demo, landing page বা MVP idea দ্রুত validate করতে চান, paid credit নেওয়ার আগে এই starter workflow useful।",
    tool_slug: "lovable",
    tools: { name: "Lovable", slug: "lovable" },
    deal_price: "Free plan",
    discount_text: "Prototype starter",
    discount_text_bn: "Prototype starter",
    deal_url: "https://lovable.dev/pricing",
    expires_at: null,
    is_active: true,
    is_featured: false,
    view_count: 0,
    click_count: 0,
    created_at: "2026-05-27T00:00:00+06:00",
    source_label: "Lovable pricing",
    source_url: "https://lovable.dev/pricing",
    highlights_bn: ["Prompt-to-app prototype", "Landing page ও UI flow দ্রুত test", "Paid credit নেওয়ার আগে MVP idea validate"],
    best_for_bn: ["Startup MVP", "Client demo", "SaaS landing page concept"],
    caution_bn: "Production launch-এর আগে code review, security, auth, database এবং deployment setup অবশ্যই check করুন।",
  },
];

export function mergeCuratedDeals<T extends { slug?: string }>(deals: T[] | null | undefined) {
  const existing = new Set((deals || []).map((deal) => deal.slug).filter(Boolean));
  return [...(deals || []), ...CURATED_DEALS.filter((deal) => !existing.has(deal.slug))];
}

export function findCuratedDeal(slug: string) {
  return CURATED_DEALS.find((deal) => deal.slug === slug) || null;
}
