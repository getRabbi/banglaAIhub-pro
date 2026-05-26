export type CuratedTool = {
  id: string;
  name: string;
  slug: string;
  tagline_bn: string;
  description_bn: string;
  pricing: "free" | "freemium" | "paid" | "enterprise";
  pricing_type: "free" | "freemium" | "paid" | "enterprise";
  website_url: string;
  logo_url: string;
  status: "published";
  category_slug: string;
  categories: { name_bn: string; slug: string; icon: string };
  use_cases: string[];
  features_bn: string[];
  pros: string[];
  cons: string[];
  faq: { q: string; a: string }[];
  badge?: string;
  rating: number;
  review_count: number;
  view_count: number;
};

export const TOOL_USE_CASES = [
  { key: "writing", label: "লেখালেখি", icon: "✍️", query: "AI writing", hint: "ব্লগ, কপি, ইমেইল, স্ক্রিপ্ট" },
  { key: "research", label: "রিসার্চ", icon: "🔎", query: "AI research", hint: "সোর্সসহ দ্রুত উত্তর" },
  { key: "image", label: "ইমেজ", icon: "🎨", query: "AI image", hint: "থাম্বনেইল, পোস্টার, ব্র্যান্ড ভিজ্যুয়াল" },
  { key: "video", label: "ভিডিও", icon: "🎬", query: "AI video", hint: "রিলস, এডিটিং, জেনারেটিভ ভিডিও" },
  { key: "voice", label: "ভয়েস", icon: "🎙️", query: "AI voice", hint: "ভয়েসওভার, ডাবিং, অডিও" },
  { key: "coding", label: "কোডিং", icon: "💻", query: "AI coding", hint: "কোড লেখা, রিভিউ, ডিবাগ" },
  { key: "automation", label: "অটোমেশন", icon: "⚙️", query: "AI automation", hint: "ওয়ার্কফ্লো, ফর্ম, CRM, নোটিফিকেশন" },
  { key: "presentation", label: "প্রেজেন্টেশন", icon: "📊", query: "AI presentation", hint: "স্লাইড, পিচ ডেক, রিপোর্ট" },
];

export const CURATED_TOOLS: CuratedTool[] = [
  {
    id: "curated-chatgpt",
    name: "ChatGPT",
    slug: "chatgpt",
    tagline_bn: "লেখালেখি, আইডিয়া, কোডিং ও দৈনন্দিন AI সহকারীর জন্য জনপ্রিয় টুল।",
    description_bn:
      "ChatGPT সাধারণ AI assistant হিসেবে কনটেন্ট আইডিয়া, বাংলা-ইংরেজি ড্রাফট, কোড ব্যাখ্যা, রিসার্চ প্ল্যান এবং প্রোডাক্টিভিটি কাজে ব্যবহার করা যায়। ফ্রিল্যান্সার, স্টুডেন্ট ও ছোট টিমের জন্য এটি দ্রুত শুরু করার মতো একটি বহুমুখী টুল।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://chatgpt.com/",
    logo_url: "",
    status: "published",
    category_slug: "ai-productivity",
    categories: { name_bn: "প্রোডাক্টিভিটি", slug: "ai-productivity", icon: "⚡" },
    use_cases: ["writing", "research", "coding"],
    features_bn: ["কনটেন্ট ড্রাফট ও আইডিয়া", "কোড ব্যাখ্যা ও ডিবাগিং সহায়তা", "ডকুমেন্ট সারাংশ ও পরিকল্পনা"],
    pros: ["বহুমুখী কাজে ব্যবহারযোগ্য", "শুরু করা সহজ", "বাংলা প্রম্পটেও কাজ করে"],
    cons: ["গুরুত্বপূর্ণ তথ্য আলাদা করে যাচাই করা দরকার", "দীর্ঘ কাজের জন্য পরিষ্কার প্রম্পট লাগে"],
    faq: [
      { q: "ChatGPT কোন কাজে ভালো?", a: "লেখালেখি, আইডিয়া, কোড ব্যাখ্যা, রিসার্চ প্ল্যান এবং দৈনন্দিন productivity কাজে ভালো।" },
      { q: "বাংলায় ব্যবহার করা যায়?", a: "হ্যাঁ, বাংলা নির্দেশনা দিয়ে ড্রাফট, সারাংশ ও পরিকল্পনা তৈরি করা যায়।" },
    ],
    badge: "popular",
    rating: 4.8,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-claude",
    name: "Claude",
    slug: "claude",
    tagline_bn: "লম্বা ডকুমেন্ট, বিশ্লেষণ, রাইটিং ও কোডিং কাজে শক্তিশালী AI assistant।",
    description_bn:
      "Claude বড় ডকুমেন্ট পড়া, লেখা পরিষ্কার করা, বিশ্লেষণ, কোডিং আইডিয়া এবং structured output তৈরির কাজে ব্যবহারযোগ্য। লম্বা context নিয়ে কাজ করতে হলে এটি ভালো বিকল্প।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://claude.ai/",
    logo_url: "",
    status: "published",
    category_slug: "ai-productivity",
    categories: { name_bn: "প্রোডাক্টিভিটি", slug: "ai-productivity", icon: "⚡" },
    use_cases: ["writing", "research", "coding"],
    features_bn: ["লম্বা ডকুমেন্ট বিশ্লেষণ", "রাইটিং স্ট্রাকচার উন্নত করা", "কোড ও টেকনিক্যাল ব্যাখ্যা"],
    pros: ["লম্বা লেখায় ভালো", "পরিষ্কার উত্তর দেয়", "ডকুমেন্টভিত্তিক কাজে শক্তিশালী"],
    cons: ["সব দেশে/প্ল্যানে একই সুবিধা নাও থাকতে পারে", "ফ্যাক্ট যাচাই দরকার"],
    faq: [{ q: "Claude কার জন্য?", a: "রাইটার, রিসার্চার, ডেভেলপার এবং যারা লম্বা ডকুমেন্ট নিয়ে কাজ করেন তাদের জন্য।" }],
    badge: "editors_choice",
    rating: 4.7,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-perplexity",
    name: "Perplexity",
    slug: "perplexity",
    tagline_bn: "সোর্সসহ দ্রুত রিসার্চ ও প্রশ্নের উত্তর খোঁজার জন্য AI সার্চ টুল।",
    description_bn:
      "Perplexity দ্রুত web research, citationসহ answer, টপিক সারাংশ এবং comparison করার কাজে সহায়ক। ব্লগ, YouTube script বা client research শুরু করার আগে source discovery করতে কাজে লাগে।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://www.perplexity.ai/",
    logo_url: "",
    status: "published",
    category_slug: "ai-research",
    categories: { name_bn: "রিসার্চ", slug: "ai-research", icon: "🔎" },
    use_cases: ["research", "writing"],
    features_bn: ["সোর্সসহ উত্তর", "দ্রুত টপিক সারাংশ", "রিসার্চ query follow-up"],
    pros: ["রিসার্চ শুরু করতে দ্রুত", "citation দেখা যায়", "comparison কাজে সুবিধাজনক"],
    cons: ["সোর্স নিজে পড়ে যাচাই করা উচিত", "সব উত্তর final ধরে নেওয়া যাবে না"],
    faq: [{ q: "Perplexity কি Google-এর বিকল্প?", a: "পুরোপুরি নয়; এটি AI-assisted research assistant হিসেবে ভালো, কিন্তু source verification দরকার।" }],
    badge: "trending",
    rating: 4.6,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-canva-magic-studio",
    name: "Canva Magic Studio",
    slug: "canva-magic-studio",
    tagline_bn: "ডিজাইন, সোশ্যাল পোস্ট, প্রেজেন্টেশন ও মার্কেটিং ভিজ্যুয়ালের জন্য AI design suite।",
    description_bn:
      "Canva Magic Studio non-designer users-দের জন্য দ্রুত পোস্টার, social creative, presentation, thumbnail এবং marketing visual বানাতে সাহায্য করে। ছোট ব্যবসা ও creator workflow-তে এটি ব্যবহারযোগ্য।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://www.canva.com/magic/",
    logo_url: "",
    status: "published",
    category_slug: "ai-design",
    categories: { name_bn: "ডিজাইন", slug: "ai-design", icon: "🎨" },
    use_cases: ["image", "presentation", "writing"],
    features_bn: ["AI design generation", "প্রেজেন্টেশন ও social template", "ইমেজ ও কপি সহায়তা"],
    pros: ["শুরু করা সহজ", "টেমপ্লেট ecosystem বড়", "টিমের জন্য practical"],
    cons: ["সব advanced asset free নাও হতে পারে", "brand consistency নিজে ঠিক করতে হয়"],
    faq: [{ q: "কোন কাজে ব্যবহার করব?", a: "Facebook পোস্ট, থাম্বনেইল, প্রেজেন্টেশন, ব্যানার এবং basic brand creative বানাতে।" }],
    badge: "popular",
    rating: 4.6,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-capcut",
    name: "CapCut",
    slug: "capcut",
    tagline_bn: "রিলস, শর্টস, caption, template ও AI video editing-এর জন্য সহজ টুল।",
    description_bn:
      "CapCut creator ও small business team-দের জন্য short-form video edit, caption, template, background remove এবং AI-powered creative কাজে ব্যবহারযোগ্য। দ্রুত social video বানাতে এটি ভালো starting point।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://www.capcut.com/",
    logo_url: "",
    status: "published",
    category_slug: "ai-video",
    categories: { name_bn: "ভিডিও", slug: "ai-video", icon: "🎬" },
    use_cases: ["video"],
    features_bn: ["ভিডিও এডিটিং ও template", "caption ও audio tools", "সোশ্যাল ভিডিও workflow"],
    pros: ["রিলস/শর্টস বানানো সহজ", "অনেক ready template", "মোবাইল workflow ভালো"],
    cons: ["ভালো result-এর জন্য manual edit লাগে", "কিছু feature paid হতে পারে"],
    faq: [{ q: "CapCut কার জন্য?", a: "Creator, marketer, small business এবং social video editor-দের জন্য।" }],
    badge: "popular",
    rating: 4.5,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-runway",
    name: "Runway",
    slug: "runway",
    tagline_bn: "জেনারেটিভ ভিডিও, image-to-video ও creative AI production-এর জন্য advanced টুল।",
    description_bn:
      "Runway creative video generation, image-to-video, editing এবং experimental visual production workflow-তে ব্যবহার করা হয়। ad concept, music video, storyboard বা creative demo বানাতে কাজে লাগতে পারে।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://runwayml.com/",
    logo_url: "",
    status: "published",
    category_slug: "ai-video",
    categories: { name_bn: "ভিডিও", slug: "ai-video", icon: "🎬" },
    use_cases: ["video", "image"],
    features_bn: ["জেনারেটিভ ভিডিও", "image-to-video workflow", "creative editing tools"],
    pros: ["creative output শক্তিশালী", "ভিডিও ideation দ্রুত", "প্রোডাকশন demo-তে ভালো"],
    cons: ["প্রম্পট ও iteration দরকার", "commercial work-এর আগে rights/policy দেখা উচিত"],
    faq: [{ q: "Runway কি beginner-friendly?", a: "Basic কাজ শুরু করা যায়, কিন্তু ভালো result-এর জন্য prompt, reference ও edit workflow দরকার।" }],
    badge: "trending",
    rating: 4.5,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-elevenlabs",
    name: "ElevenLabs",
    slug: "elevenlabs",
    tagline_bn: "AI voiceover, text-to-speech, dubbing ও audio content-এর জন্য জনপ্রিয় ভয়েস টুল।",
    description_bn:
      "ElevenLabs text-to-speech, voiceover, dubbing এবং audio narration workflow-তে ব্যবহার করা যায়। YouTube, course, podcast snippet বা product demo voice বানাতে কাজে লাগে।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://elevenlabs.io/",
    logo_url: "",
    status: "published",
    category_slug: "ai-audio",
    categories: { name_bn: "অডিও", slug: "ai-audio", icon: "🎙️" },
    use_cases: ["voice", "video"],
    features_bn: ["Text-to-speech", "Voiceover ও narration", "Dubbing workflow"],
    pros: ["ভয়েস quality ভালো", "ভিডিও কনটেন্টে useful", "দ্রুত narration তৈরি করা যায়"],
    cons: ["ভয়েস cloning ব্যবহারে consent জরুরি", "বাংলা/উচ্চারণ result test করা উচিত"],
    faq: [{ q: "ElevenLabs কী কাজে ভালো?", a: "Voiceover, narration, dubbing এবং audio-first content তৈরিতে।" }],
    badge: "editors_choice",
    rating: 4.6,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-cursor",
    name: "Cursor",
    slug: "cursor",
    tagline_bn: "AI-powered code editor, codebase chat, refactor ও debugging workflow-এর জন্য।",
    description_bn:
      "Cursor developer-দের জন্য AI coding assistant সহ editor experience দেয়। codebase বুঝে প্রশ্ন করা, refactor, test generation এবং bug fixing workflow দ্রুত করতে ব্যবহার করা যায়।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://www.cursor.com/",
    logo_url: "",
    status: "published",
    category_slug: "ai-development",
    categories: { name_bn: "ডেভেলপমেন্ট", slug: "ai-development", icon: "💻" },
    use_cases: ["coding", "automation"],
    features_bn: ["Codebase chat", "AI-assisted editing", "Refactor ও debugging support"],
    pros: ["ডেভেলপার workflow-তে সরাসরি কাজ করে", "বড় codebase বুঝতে সাহায্য করে", "প্রোটোটাইপ দ্রুত হয়"],
    cons: ["AI output review না করলে bug আসতে পারে", "privacy-sensitive code নিয়ে policy দেখা দরকার"],
    faq: [{ q: "Cursor কি VS Code-এর বিকল্প?", a: "অনেক ক্ষেত্রে VS Code-like workflow-এর সাথে AI coding সুবিধা দেয়, তবে team policy অনুযায়ী ব্যবহার করা উচিত।" }],
    badge: "trending",
    rating: 4.7,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-zapier-ai",
    name: "Zapier AI",
    slug: "zapier-ai",
    tagline_bn: "অ্যাপ সংযোগ, repetitive task automation ও AI workflow তৈরির জন্য।",
    description_bn:
      "Zapier AI apps connect করে lead capture, notification, CRM update, content workflow এবং internal automation বানাতে সাহায্য করে। non-technical team-ও basic automation শুরু করতে পারে।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://zapier.com/ai",
    logo_url: "",
    status: "published",
    category_slug: "ai-automation",
    categories: { name_bn: "অটোমেশন", slug: "ai-automation", icon: "⚙️" },
    use_cases: ["automation"],
    features_bn: ["App-to-app automation", "AI workflow assistant", "Lead ও notification process"],
    pros: ["অনেক app integration", "no-code workflow সহজ", "ব্যবসায়িক process automate করা যায়"],
    cons: ["Complex flow-তে planning দরকার", "usage limit ও cost আগে দেখা উচিত"],
    faq: [{ q: "Zapier AI কী কাজে ব্যবহার করব?", a: "Form submission, email, spreadsheet, CRM, Slack/Telegram notification এবং repetitive task automate করতে।" }],
    badge: "best_value",
    rating: 4.4,
    review_count: 1,
    view_count: 0,
  },
  {
    id: "curated-grammarly",
    name: "Grammarly",
    slug: "grammarly",
    tagline_bn: "ইংরেজি writing, grammar, tone ও communication polish করার জন্য AI writing assistant।",
    description_bn:
      "Grammarly email, proposal, blog draft, academic writing এবং client communication পরিষ্কার করতে সাহায্য করে। বাংলাদেশি freelancer-দের ইংরেজি proposal polish করার কাজে এটি practical।",
    pricing: "freemium",
    pricing_type: "freemium",
    website_url: "https://www.grammarly.com/",
    logo_url: "",
    status: "published",
    category_slug: "ai-writing",
    categories: { name_bn: "রাইটিং", slug: "ai-writing", icon: "✍️" },
    use_cases: ["writing"],
    features_bn: ["Grammar ও spelling suggestion", "Tone improvement", "ইমেইল ও proposal polish"],
    pros: ["Client communication-এ useful", "Browser/editor integration আছে", "ইংরেজি writing দ্রুত polish হয়"],
    cons: ["সব suggestion blindly নেওয়া ঠিক না", "বাংলা writing-এর জন্য primary tool নয়"],
    faq: [{ q: "Grammarly কার জন্য?", a: "ইংরেজিতে email, proposal, article বা academic draft লেখেন এমন ব্যবহারকারীদের জন্য।" }],
    badge: "popular",
    rating: 4.4,
    review_count: 1,
    view_count: 0,
  },
];

export function getCuratedTools(options: { pricing?: string; categorySlug?: string; query?: string } = {}) {
  const query = options.query?.trim().toLowerCase();
  return CURATED_TOOLS.filter((tool) => {
    if (options.pricing && tool.pricing !== options.pricing && tool.pricing_type !== options.pricing) return false;
    if (options.categorySlug && tool.category_slug !== options.categorySlug && tool.categories.slug !== options.categorySlug) return false;
    if (!query) return true;
    const haystack = [
      tool.name,
      tool.slug,
      tool.tagline_bn,
      tool.description_bn,
      tool.categories.name_bn,
      ...tool.use_cases,
      ...tool.features_bn,
    ]
      .join(" ")
      .toLowerCase();
    return haystack.includes(query);
  });
}

export function mergeCuratedTools<T extends { slug?: string }>(tools: T[] | null | undefined, curated = CURATED_TOOLS) {
  const existing = new Set((tools || []).map((tool) => tool.slug).filter(Boolean));
  return [...(tools || []), ...curated.filter((tool) => !existing.has(tool.slug))];
}

export function findCuratedTool(slug: string) {
  return CURATED_TOOLS.find((tool) => tool.slug === slug) || null;
}
