import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Metadata } from "next";
import type { ReactNode } from "react";
import { PRICING_LABELS, BADGE_LABELS } from "@/lib/constants";
import { findCuratedTool, getCuratedTools } from "@/lib/curated-tools";
import { normalizeTool, normalizeTools } from "@/lib/schema-normalizers";

export const revalidate = 3600;

type PanelTone = "cyan" | "green" | "orange" | "rose" | "blue" | "neutral";

type CompanyProfile = {
  company: string;
  code: string;
  productType: string;
  marketPosition: string;
  trustNote: string;
};

type CategoryGuide = {
  primaryJob: string;
  outputs: string[];
  workflowFocus: string[];
  qualityChecks: string[];
  bdAngles: string[];
};

const COMPANY_PROFILES: Record<string, Partial<CompanyProfile>> = {
  chatgpt: {
    company: "OpenAI",
    code: "OAI",
    productType: "General AI assistant",
    marketPosition: "লেখালেখি, রিসার্চ, কোডিং এবং দৈনন্দিন প্রোডাক্টিভিটির জন্য শক্তিশালী all-rounder assistant.",
  },
  claude: {
    company: "Anthropic",
    code: "ANT",
    productType: "Long-context AI assistant",
    marketPosition: "লম্বা ডকুমেন্ট রিভিউ, structured writing এবং analysis-heavy কাজের জন্য শক্তিশালী।",
  },
  perplexity: {
    company: "Perplexity AI",
    code: "PPLX",
    productType: "AI search and research assistant",
    marketPosition: "Source-backed answer, topic discovery এবং দ্রুত research workflow-এর জন্য useful.",
  },
  "canva-magic-studio": {
    company: "Canva",
    code: "CNVA",
    productType: "AI design suite",
    marketPosition: "Non-designer team-এর social creative, presentation এবং brand visual workflow সহজ করে।",
  },
  capcut: {
    company: "CapCut",
    code: "CPCT",
    productType: "AI video editor",
    marketPosition: "Short-form video, reels, caption এবং creator editing workflow দ্রুত করে।",
  },
  runway: {
    company: "Runway",
    code: "RNWY",
    productType: "Generative video studio",
    marketPosition: "Creative video generation, image-to-video এবং concept production workflow-এর জন্য advanced option.",
  },
  elevenlabs: {
    company: "ElevenLabs",
    code: "11L",
    productType: "AI voice platform",
    marketPosition: "Voiceover, dubbing, narration এবং synthetic audio workflow-এর জন্য premium voice platform.",
  },
  cursor: {
    company: "Anysphere",
    code: "CRSR",
    productType: "AI code editor",
    marketPosition: "Developer productivity, codebase chat, refactor এবং debugging workflow দ্রুত করে।",
  },
  "zapier-ai": {
    company: "Zapier",
    code: "ZAP",
    productType: "Automation platform",
    marketPosition: "App-to-app workflow automation, notification এবং no-code business operation-এর জন্য practical.",
  },
  grammarly: {
    company: "Grammarly",
    code: "GRAM",
    productType: "AI writing assistant",
    marketPosition: "English writing clarity, tone, grammar এবং workplace communication উন্নত করতে সাহায্য করে।",
  },
  gemini: {
    company: "Google",
    code: "GOOG",
    productType: "Multimodal AI assistant",
    marketPosition: "Google ecosystem-এর research, writing এবং productivity workflow-এর জন্য useful assistant.",
  },
  "microsoft-copilot": {
    company: "Microsoft",
    code: "MSFT",
    productType: "Workplace AI assistant",
    marketPosition: "Microsoft 365, document, email, meeting এবং office productivity workflow-এর জন্য business-ready assistant.",
  },
  deepseek: {
    company: "DeepSeek",
    code: "DSK",
    productType: "Reasoning and coding assistant",
    marketPosition: "Coding, math, analysis এবং budget-sensitive AI workflow-এর জন্য strong option.",
  },
  midjourney: {
    company: "Midjourney",
    code: "MJ",
    productType: "AI image generator",
    marketPosition: "High-quality concept art, campaign visual এবং creative image generation-এর জন্য premium tool.",
  },
  "leonardo-ai": {
    company: "Leonardo.Ai",
    code: "LDO",
    productType: "AI image and asset generator",
    marketPosition: "Game asset, product visual, brand creative এবং image workflow-এর জন্য flexible generator.",
  },
  gamma: {
    company: "Gamma",
    code: "GMA",
    productType: "AI presentation builder",
    marketPosition: "Pitch deck, lesson, report এবং visual document generation দ্রুত করতে useful.",
  },
  "notion-ai": {
    company: "Notion",
    code: "NTN",
    productType: "Workspace AI assistant",
    marketPosition: "Docs, wiki, project note এবং team knowledge workflow সংগঠিত করতে সাহায্য করে।",
  },
  "github-copilot": {
    company: "GitHub",
    code: "GHCP",
    productType: "AI coding assistant",
    marketPosition: "Code completion, code review, test draft এবং IDE development workflow দ্রুত করে।",
  },
  "bolt-new": {
    company: "StackBlitz",
    code: "BOLT",
    productType: "AI app builder",
    marketPosition: "Browser-based prototype, frontend app এবং quick product demo workflow-এর জন্য useful.",
  },
  lovable: {
    company: "Lovable",
    code: "LOVE",
    productType: "AI product builder",
    marketPosition: "Prompt-to-app prototype, founder MVP এবং product UI workflow দ্রুত বানাতে সাহায্য করে।",
  },
  n8n: {
    company: "n8n",
    code: "N8N",
    productType: "Workflow automation platform",
    marketPosition: "Self-hostable automation, AI agent flow এবং technical operations workflow-এর জন্য শক্তিশালী।",
  },
  make: {
    company: "Make",
    code: "MAKE",
    productType: "Visual automation platform",
    marketPosition: "Scenario-based operations automation এবং app integration workflow visually design করতে সাহায্য করে।",
  },
  "fireflies-ai": {
    company: "Fireflies.ai",
    code: "FIR",
    productType: "AI meeting assistant",
    marketPosition: "Meeting transcription, summary, action item এবং sales/client follow-up workflow সহজ করে।",
  },
  descript: {
    company: "Descript",
    code: "DSC",
    productType: "AI audio/video editor",
    marketPosition: "Podcast, course video, transcript-based editing এবং creator workflow-এর জন্য useful editor.",
  },
  jasper: {
    company: "Jasper",
    code: "JSP",
    productType: "Marketing AI platform",
    marketPosition: "Brand voice, campaign copy এবং team marketing content workflow-এর জন্য premium writing platform.",
  },
  "copy-ai": {
    company: "Copy.ai",
    code: "COPY",
    productType: "Sales and marketing copy platform",
    marketPosition: "Cold email, ad copy, social caption এবং GTM content workflow দ্রুত করতে useful.",
  },
  "surfer-seo": {
    company: "Surfer",
    code: "SRFR",
    productType: "AI SEO content platform",
    marketPosition: "SEO brief, content score, keyword coverage এবং ranking-focused writing workflow-এর জন্য strong.",
  },
  "tidio-ai": {
    company: "Tidio",
    code: "TDIO",
    productType: "AI customer support chatbot",
    marketPosition: "Website chat, FAQ automation, lead capture এবং support handoff workflow সহজ করে।",
  },
  "airtable-ai": {
    company: "Airtable",
    code: "ATBL",
    productType: "AI business database",
    marketPosition: "CRM, operations database, project tracker এবং structured business workflow intelligence যোগ করে।",
  },
};

const CATEGORY_GUIDES: Record<string, CategoryGuide> = {
  "ai-productivity": {
    primaryJob: "দৈনন্দিন knowledge work দ্রুত, পরিষ্কার এবং repeatable workflow-এ আনা।",
    outputs: ["Draft, summary ও rewrite", "Research note ও action plan", "Email, meeting note ও checklist", "Team knowledge base update"],
    workflowFocus: ["Prompt library", "Document review", "Task planning", "Final human QA"],
    qualityChecks: ["Answer-এর source/logic verify করা", "Brand tone ও spelling check", "Sensitive data policy follow করা"],
    bdAngles: ["Freelancer proposal ও client reply", "Student research ও presentation outline", "Small team-এর admin/reporting workflow"],
  },
  "ai-writing": {
    primaryJob: "Blank page থেকে usable copy, article, script এবং communication draft তৈরি করা।",
    outputs: ["Blog outline ও article draft", "Ad copy ও social caption", "Email sequence ও proposal", "Bangla-English rewrite"],
    workflowFocus: ["Audience brief", "Tone guide", "Content calendar", "Fact-check pass"],
    qualityChecks: ["Claim verification", "Duplicate phrasing remove", "CTA and reader intent match"],
    bdAngles: ["Facebook page caption", "Marketplace gig description", "Client pitch ও follow-up message"],
  },
  "ai-research": {
    primaryJob: "প্রশ্ন থেকে reliable direction, source list এবং comparison insight বের করা।",
    outputs: ["Source-backed answer", "Competitor comparison", "Topic summary", "Research brief"],
    workflowFocus: ["Query framing", "Source review", "Evidence notes", "Decision memo"],
    qualityChecks: ["Original source খুলে দেখা", "Date ও context verify", "Conflicting answer compare"],
    bdAngles: ["Market research", "YouTube/video topic validation", "Client project discovery"],
  },
  "ai-image": {
    primaryJob: "Campaign, product, social এবং creative visual দ্রুত generate/refine করা।",
    outputs: ["Social media creative", "Thumbnail and poster", "Product concept visual", "Brand moodboard"],
    workflowFocus: ["Prompt style guide", "Reference image", "Variation selection", "Final design polish"],
    qualityChecks: ["Commercial usage terms check", "Logo/text distortion review", "Brand color consistency"],
    bdAngles: ["Facebook ad creative", "Ecommerce product mockup", "YouTube thumbnail and event poster"],
  },
  "ai-video": {
    primaryJob: "Short video, concept clip, captioned content এবং creative video workflow দ্রুত করা।",
    outputs: ["Reels/Shorts edit", "Captioned video", "Concept video", "Explainer clip"],
    workflowFocus: ["Script", "Storyboard", "Asset generation", "Manual edit and export"],
    qualityChecks: ["Audio sync", "Text readability on mobile", "Usage rights and watermark check"],
    bdAngles: ["Local business reels", "Course teaser", "Agency ad concept and creator content"],
  },
  "ai-voice": {
    primaryJob: "Voiceover, dubbing, narration এবং audio cleanup workflow production-ready করা।",
    outputs: ["Bangla/English narration", "Podcast voice workflow", "Dubbing draft", "Audio cleanup"],
    workflowFocus: ["Script cleanup", "Voice style selection", "Pronunciation pass", "Export and mix"],
    qualityChecks: ["Consent and voice rights", "Pronunciation accuracy", "Noise and loudness check"],
    bdAngles: ["YouTube voiceover", "Course narration", "Ad voice and explainer audio"],
  },
  "ai-coding": {
    primaryJob: "Code write, debug, refactor, test এবং documentation workflow দ্রুত করা।",
    outputs: ["Code suggestion", "Bug explanation", "Test case draft", "Technical documentation"],
    workflowFocus: ["Clear issue context", "Small diff review", "Test run", "Security check"],
    qualityChecks: ["Generated code manually review", "Tests and lint run", "Secrets/data exposure check"],
    bdAngles: ["Freelance delivery speed", "Portfolio app prototype", "Team code review assistance"],
  },
  "ai-automation": {
    primaryJob: "Repeated business task-কে connected workflow-এ convert করা।",
    outputs: ["Lead routing flow", "Notification automation", "Data sync", "AI summary pipeline"],
    workflowFocus: ["Trigger definition", "Data mapping", "Error handling", "Monitoring"],
    qualityChecks: ["Failure path test", "Duplicate data prevention", "API quota and billing watch"],
    bdAngles: ["Facebook lead to CRM", "Telegram alert", "Order/support tracking and report automation"],
  },
  "ai-presentation": {
    primaryJob: "Idea, report অথবা pitch-কে structured visual deck-এ convert করা।",
    outputs: ["Pitch deck", "Class/report slides", "Client proposal deck", "Visual memo"],
    workflowFocus: ["Audience goal", "Slide outline", "Visual hierarchy", "Speaker note"],
    qualityChecks: ["One idea per slide", "Font and contrast readability", "Data/chart accuracy"],
    bdAngles: ["Startup pitch", "University presentation", "Agency client proposal"],
  },
  "ai-website": {
    primaryJob: "Prompt থেকে landing page, MVP, prototype অথবা website flow দ্রুত তৈরি করা।",
    outputs: ["Landing page draft", "App prototype", "UI flow", "Frontend code starter"],
    workflowFocus: ["Product brief", "Component structure", "Responsive check", "Production review"],
    qualityChecks: ["Mobile layout", "Security/auth review", "SEO and performance basics"],
    bdAngles: ["Client demo", "SaaS MVP", "Portfolio or ecommerce landing page"],
  },
  "ai-marketing": {
    primaryJob: "Campaign planning, copy generation, brand voice এবং acquisition workflow organize করা।",
    outputs: ["Ad copy", "Campaign brief", "Landing page copy", "Email/social sequence"],
    workflowFocus: ["ICP", "Offer", "Channel plan", "Creative testing"],
    qualityChecks: ["Claim compliance", "Brand tone", "Conversion metric tracking"],
    bdAngles: ["Facebook campaign", "Ecommerce launch", "Agency content calendar"],
  },
  "ai-seo": {
    primaryJob: "Search intent, keyword coverage এবং content optimization systematic করা।",
    outputs: ["SEO brief", "Keyword cluster", "Content score", "On-page checklist"],
    workflowFocus: ["SERP review", "Content outline", "Optimization pass", "Performance tracking"],
    qualityChecks: ["Search intent match", "Over-optimization avoid", "Helpful content quality"],
    bdAngles: ["Niche blog", "Affiliate content", "Service business local SEO"],
  },
  "ai-chatbot": {
    primaryJob: "Website visitor, customer question এবং lead capture-কে automated support flow-এ আনা।",
    outputs: ["FAQ chatbot", "Lead capture flow", "Support handoff", "Conversation report"],
    workflowFocus: ["Knowledge base", "Fallback rules", "Human handoff", "Conversation review"],
    qualityChecks: ["Wrong answer guardrail", "Privacy notice", "Escalation path"],
    bdAngles: ["Ecommerce support", "Course/service inquiry", "WhatsApp/Facebook lead follow-up"],
  },
  "ai-business": {
    primaryJob: "Business data, operations, CRM এবং reporting workflow-তে structured intelligence যোগ করা।",
    outputs: ["CRM summary", "Project tracker", "Operations report", "Data categorization"],
    workflowFocus: ["Data model", "Permission control", "Automation rule", "Dashboard review"],
    qualityChecks: ["Data accuracy", "Role-based access", "Manual override path"],
    bdAngles: ["Agency operation", "SME sales pipeline", "Content/business reporting"],
  },
};

const DEFAULT_GUIDE: CategoryGuide = {
  primaryJob: "Specific task-কে faster, structured এবং reviewable AI workflow-এ convert করা।",
  outputs: ["Draft output", "Workflow checklist", "Team-ready summary", "Reusable template"],
  workflowFocus: ["Goal define", "Input organize", "AI output generate", "Manual QA and publish"],
  qualityChecks: ["Fact and policy verify", "Brand tone align", "Cost and privacy review"],
  bdAngles: ["Freelancing delivery", "Small business workflow", "Content and operations productivity"],
};

const TONE_CLASSES: Record<PanelTone, { box: string; icon: string; label: string; bar: string }> = {
  cyan: {
    box: "border-cyan-400/20 bg-cyan-400/[0.055]",
    icon: "bg-cyan-400/12 text-cyan-200 border-cyan-300/20",
    label: "text-cyan-200",
    bar: "bg-cyan-300",
  },
  green: {
    box: "border-emerald-400/20 bg-emerald-400/[0.055]",
    icon: "bg-emerald-400/12 text-emerald-200 border-emerald-300/20",
    label: "text-emerald-200",
    bar: "bg-emerald-300",
  },
  orange: {
    box: "border-orange-400/20 bg-orange-400/[0.06]",
    icon: "bg-orange-400/12 text-orange-200 border-orange-300/20",
    label: "text-orange-200",
    bar: "bg-orange-300",
  },
  rose: {
    box: "border-rose-400/20 bg-rose-400/[0.055]",
    icon: "bg-rose-400/12 text-rose-200 border-rose-300/20",
    label: "text-rose-200",
    bar: "bg-rose-300",
  },
  blue: {
    box: "border-blue-400/20 bg-blue-400/[0.055]",
    icon: "bg-blue-400/12 text-blue-200 border-blue-300/20",
    label: "text-blue-200",
    bar: "bg-blue-300",
  },
  neutral: {
    box: "border-white/10 bg-white/[0.035]",
    icon: "bg-white/[0.06] text-gray-200 border-white/10",
    label: "text-gray-300",
    bar: "bg-gray-300",
  },
};

function getHostName(url?: string) {
  if (!url) return "";
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return url.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  }
}

function getInitials(value: string) {
  const parts = value
    .replace(/[^a-zA-Z0-9 ]/g, " ")
    .split(" ")
    .map((part) => part.trim())
    .filter(Boolean);
  const initials = parts.length > 1 ? parts.map((part) => part[0]).join("") : value.slice(0, 4);
  return initials.toUpperCase().slice(0, 4) || "AI";
}

function titleCaseHost(host: string) {
  const first = host.split(".")[0] || "";
  if (!first) return "";
  return first.charAt(0).toUpperCase() + first.slice(1).replace(/-/g, " ");
}

function getCompanyProfile(tool: any): CompanyProfile {
  const host = getHostName(tool.website_url);
  const profile = COMPANY_PROFILES[tool.slug] || {};
  const company = profile.company || tool.company_name || tool.vendor || titleCaseHost(host) || tool.name;

  return {
    company,
    code: profile.code || getInitials(company),
    productType: profile.productType || `${tool.categories?.name_bn || "AI"} focused platform`,
    marketPosition: profile.marketPosition || `${tool.name} মূলত ${tool.categories?.name_bn || "AI workflow"} কাজকে দ্রুত, repeatable এবং team-ready করতে সাহায্য করে।`,
    trustNote:
      profile.trustNote ||
      "Official website, workspace permission, privacy setting এবং billing limit দেখে ব্যবহার করলে risk কম থাকে।",
  };
}

function getGuide(categorySlug?: string): CategoryGuide {
  return (categorySlug && CATEGORY_GUIDES[categorySlug]) || DEFAULT_GUIDE;
}

function listOf(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string" && item.trim()) : [];
}

function takeUnique(items: string[], fallback: string[], limit: number) {
  const seen = new Set<string>();
  return [...items, ...fallback].filter((item) => {
    const key = item.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  }).slice(0, limit);
}

function getPricingNote(pricing?: string) {
  if (pricing === "free") return "শুরু করার barrier কম; paid upgrade লাগার আগে output quality benchmark করে নিন।";
  if (pricing === "paid") return "Paid workflow হওয়ায় team use, ROI এবং monthly usage আগে হিসাব করা ভালো।";
  if (pricing === "enterprise") return "Team security, admin control, procurement এবং support SLA দেখে decision নিন।";
  return "Free tier দিয়ে test করা যায়, কিন্তু serious workflow-এর জন্য paid limit/credit ভালোভাবে দেখা দরকার।";
}

function getFitLabel(score: number) {
  if (score >= 90) return "Excellent";
  if (score >= 82) return "Strong";
  if (score >= 72) return "Good";
  return "Needs review";
}

function SectionHeader({ eyebrow, title, description }: { eyebrow: string; title: string; description?: string }) {
  return (
    <div className="mb-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200/80">{eyebrow}</p>
      <h2 className="text-2xl font-extrabold text-white sm:text-3xl">{title}</h2>
      {description && <p className="mt-2 max-w-3xl text-sm leading-7 text-gray-400">{description}</p>}
    </div>
  );
}

function DetailPanel({
  tone = "neutral",
  icon,
  title,
  label,
  children,
}: {
  tone?: PanelTone;
  icon?: ReactNode;
  title: string;
  label?: string;
  children: ReactNode;
}) {
  const styles = TONE_CLASSES[tone];
  return (
    <div className={`min-w-0 rounded-lg border p-4 shadow-[0_18px_40px_rgba(0,0,0,0.16)] ${styles.box}`}>
      <div className="mb-3 flex items-center gap-3">
        {icon && <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg border text-base ${styles.icon}`}>{icon}</span>}
        <div className="min-w-0">
          {label && <p className={`text-xs font-bold uppercase tracking-[0.1em] ${styles.label}`}>{label}</p>}
          <h3 className="text-base font-bold leading-snug text-white">{title}</h3>
        </div>
      </div>
      <div className="text-sm leading-7 text-gray-300">{children}</div>
    </div>
  );
}

function NumberedPanel({ index, title, text, tone = "neutral" }: { index: number; title: string; text: string; tone?: PanelTone }) {
  const styles = TONE_CLASSES[tone];
  return (
    <div className={`rounded-lg border p-4 ${styles.box}`}>
      <div className="mb-3 flex items-center gap-3">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-lg border text-sm font-black ${styles.icon}`}>{index}</span>
        <h3 className="text-base font-bold text-white">{title}</h3>
      </div>
      <p className="text-sm leading-7 text-gray-300">{text}</p>
    </div>
  );
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createServerClient();
  const { data: tool } = await sb.from("tools").select("name, tagline_bn, slug").eq("slug", params.slug).single();
  const curated = tool ? null : findCuratedTool(params.slug);
  if (!tool && !curated) return { title: "টুল পাওয়া যায়নি" };
  const item = tool || curated!;
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  return {
    title: `${item.name} - রিভিউ, ব্যবহার, দাম ও বিকল্প`,
    description: item.tagline_bn || `${item.name} AI tool review in Bangla`,
    openGraph: { title: item.name, description: item.tagline_bn, url: `${base}/tools/${item.slug}`, images: [`${base}/api/og/${item.slug}`] },
  };
}

export default async function ToolDetail({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: rawTool } = await sb.from("tools").select("*, categories(name_bn, slug, icon)").eq("slug", params.slug).eq("status", "published").single();
  const curatedTool = rawTool ? null : findCuratedTool(params.slug);
  if (!rawTool && !curatedTool) notFound();
  const tool = rawTool ? normalizeTool(rawTool) : curatedTool!;

  if (rawTool) {
    try {
      await sb.rpc("increment_view", { tbl: "tools", slug_val: params.slug });
    } catch {
      // View counts should not block page rendering.
    }
  }

  let alternatives: any[] = [];
  if (rawTool) {
    const { data: altLinks } = await sb.from("tool_alternatives").select("alternative_id").eq("tool_id", tool.id);
    if (altLinks && altLinks.length > 0) {
      const ids = altLinks.map((a: any) => a.alternative_id);
      const { data } = await sb.from("tools").select("name, slug, logo_url, pricing_type, tagline_bn, status").in("id", ids).eq("status", "published");
      alternatives = normalizeTools(data);
    }
  }
  if (alternatives.length === 0 && tool.categories?.slug) {
    alternatives = getCuratedTools({ categorySlug: tool.categories.slug }).filter((item) => item.slug !== tool.slug).slice(0, 4);
  }

  const faq = Array.isArray(tool.faq) ? tool.faq.filter((item: any) => item?.q && item?.a) : [];
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const categoryName = tool.categories?.name_bn || "AI টুল";
  const categorySlug = tool.categories?.slug || "";
  const pricingLabel = tool.pricing && PRICING_LABELS[tool.pricing] ? PRICING_LABELS[tool.pricing].label : "ফ্রিমিয়াম/পেইড";
  const company = getCompanyProfile(tool);
  const guide = getGuide(categorySlug);
  const host = getHostName(tool.website_url);
  const features = takeUnique(listOf(tool.features_bn), guide.outputs, 6);
  const pros = listOf(tool.pros);
  const cons = listOf(tool.cons);
  const bestFor = tool.best_for_bn || [
    `${categoryName} workflow শুরু করতে চান এমন freelancer, creator বা small team`,
    "কম সময়ে draft, idea, automation বা client-ready output তৈরি করতে চান",
    "বাংলাদেশি market অনুযায়ী কম খরচে productivity বাড়াতে চান",
  ];
  const bdUseCases = tool.bd_use_cases_bn || guide.bdAngles;
  const workflow = tool.workflow_bn || [
    "Goal brief লিখুন: output কী, audience কারা, language/style কেমন হবে এবং final format কী।",
    `${tool.name}-এ একটি ছোট real task দিন এবং result quality, speed ও edit effort compare করুন।`,
    "ভালো result পেলে reusable prompt, template বা workflow checklist বানিয়ে রাখুন।",
    "Final publish/send করার আগে fact, tone, spelling, privacy এবং commercial usage policy check করুন।",
  ];
  const setupSteps = tool.setup_steps_bn || [
    "Official website থেকে account খুলুন এবং billing/credit limit আগে দেখে নিন।",
    "একটি ছোট real কাজ দিয়ে baseline output তৈরি করুন, তারপর prompt refine করুন।",
    "Team use হলে role, permission, data sharing এবং export option test করুন।",
    "Repeated workflow থাকলে prompt template, naming convention এবং QA checklist standard করুন।",
  ];
  const selectionTips = tool.selection_tips_bn || [
    `আপনার main কাজ ${categoryName} হলে shortlist-এ রাখুন, কিন্তু একই category-এর 2-3টি alternative test করুন।`,
    "Free limit, export quality, commercial usage policy, team permission এবং privacy setting মিলিয়ে দেখুন।",
    "এক সপ্তাহ real workflow-এ ব্যবহার করে time saved, edit effort এবং final output quality compare করুন।",
  ];
  const limitations = tool.limitations_bn || (cons.length > 0 ? cons : [
    "AI output final truth ধরে নেওয়া যাবে না; important তথ্য verify করা দরকার।",
    "Brand voice, legal/compliance এবং sensitive data ব্যবহারে manual review দরকার।",
    "ভালো result পেতে clear input, sample, iteration এবং human QA দরকার হতে পারে।",
  ]);
  const expectedOutputs = takeUnique(features, guide.outputs, 6);
  const ratingScore = tool.rating > 0 ? Math.min(96, Math.round(tool.rating * 20)) : 82;
  const valueScore = tool.pricing === "free" ? 92 : tool.pricing === "freemium" ? 86 : tool.pricing === "paid" ? 78 : 74;
  const setupScore = categorySlug === "ai-automation" || categorySlug === "ai-business" ? 74 : categorySlug === "ai-coding" ? 80 : 88;
  const bdScore = categorySlug === "ai-voice" || categorySlug === "ai-chatbot" ? 78 : 84;
  const scoreCards = [
    { label: "Output quality", score: ratingScore, tone: "cyan" as PanelTone },
    { label: "Cost control", score: valueScore, tone: "green" as PanelTone },
    { label: "Setup ease", score: setupScore, tone: "orange" as PanelTone },
    { label: "BD workflow fit", score: bdScore, tone: "blue" as PanelTone },
  ];
  const stackFlow = [
    { title: "Input layer", text: "Brief, document, prompt, asset, customer question বা data source ঠিকভাবে সাজালে output অনেক ভালো হয়।" },
    { title: "AI work layer", text: `${tool.name} draft, generation, summary, automation অথবা analysis অংশে main engine হিসেবে কাজ করে।` },
    { title: "QA layer", text: "Human review, brand guideline, fact-check, privacy check এবং final formatting ছাড়া publish করা উচিত না।" },
  ];
  const useCaseMatrix = [
    { title: "Freelancer", text: bdUseCases[0] || guide.bdAngles[0], tone: "cyan" as PanelTone },
    { title: "Small business", text: bdUseCases[1] || guide.bdAngles[1], tone: "green" as PanelTone },
    { title: "Creator/marketer", text: bdUseCases[2] || guide.bdAngles[2], tone: "orange" as PanelTone },
    { title: "Team workflow", text: guide.primaryJob, tone: "blue" as PanelTone },
  ];
  const quickStats = [
    { label: "Company", value: company.company },
    { label: "Category", value: categoryName },
    { label: "Pricing", value: pricingLabel },
    { label: "Rating", value: tool.rating > 0 ? `${tool.rating}/5` : "Review pending" },
  ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.description_bn || tool.tagline_bn,
    url: `${base}/tools/${tool.slug}`,
    applicationCategory: "WebApplication",
    offers: { "@type": "Offer", price: tool.pricing === "free" ? "0" : "", priceCurrency: "USD" },
    aggregateRating: tool.rating > 0 ? { "@type": "AggregateRating", ratingValue: tool.rating, reviewCount: tool.review_count || 1 } : undefined,
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-gray-300">হোম</Link>
          <span>/</span>
          <Link href="/tools" className="hover:text-gray-300">টুলস</Link>
          {tool.categories && (
            <>
              <span>/</span>
              <Link href={`/categories/${tool.categories.slug}`} className="hover:text-gray-300">{tool.categories.name_bn}</Link>
            </>
          )}
          <span>/</span>
          <span className="text-gray-400">{tool.name}</span>
        </nav>

        <section className="mb-8 grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
          <div className="glass-card glow-blue overflow-hidden p-5 sm:p-7">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
              <div className="grid h-20 w-20 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.05]">
                {tool.logo_url ? (
                  <Image src={tool.logo_url} alt="" width={60} height={60} className="h-14 w-14 rounded-lg object-contain" />
                ) : (
                  <span className="text-2xl font-black text-cyan-100">{company.code}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <span className="rounded-lg border border-cyan-300/20 bg-cyan-300/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.12em] text-cyan-100">
                    কোম্পানি কোড: {company.code}
                  </span>
                  {tool.pricing && PRICING_LABELS[tool.pricing] && (
                    <span className={`rounded-lg border px-2.5 py-1 text-xs font-bold ${PRICING_LABELS[tool.pricing].color}`}>{PRICING_LABELS[tool.pricing].label}</span>
                  )}
                  {tool.badge && BADGE_LABELS[tool.badge] && (
                    <span className="rounded-lg border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-xs font-bold text-amber-200">
                      {BADGE_LABELS[tool.badge].icon} {BADGE_LABELS[tool.badge].label}
                    </span>
                  )}
                </div>
                <h1 className="max-w-4xl text-3xl font-black leading-tight text-white sm:text-5xl">{tool.name}</h1>
                <p className="mt-4 max-w-3xl text-base leading-8 text-gray-300 sm:text-lg">{tool.tagline_bn || tool.tagline || company.marketPosition}</p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {quickStats.map((item) => (
                    <div key={item.label} className="rounded-lg border border-white/10 bg-black/[0.18] p-3">
                      <p className="text-xs font-bold uppercase tracking-[0.1em] text-gray-500">{item.label}</p>
                      <p className="mt-1 text-sm font-bold text-white">{item.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="glass-card glow-orange p-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-200/80">Review snapshot</p>
            <h2 className="text-xl font-extrabold text-white">কেন shortlist করবেন?</h2>
            <p className="mt-3 text-sm leading-7 text-gray-300">{company.marketPosition}</p>
            <div className="mt-5 space-y-3">
              {scoreCards.map((item) => {
                const tone = TONE_CLASSES[item.tone];
                return (
                  <div key={item.label} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-gray-200">{item.label}</span>
                      <span className={`text-xs font-bold ${tone.label}`}>{getFitLabel(item.score)}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </aside>
        </section>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_340px]">
          <main className="min-w-0">
            <section className="mb-8">
              <SectionHeader
                eyebrow="Executive summary"
                title={`${tool.name} আসলে কী কাজে সবচেয়ে ভালো`}
                description={`${tool.name} ${categoryName} workflow-এ কোথায় fit করে, কী output আশা করবেন, এবং paid/free decision নেওয়ার আগে কোন বিষয়গুলো দেখা দরকার - সবকিছু নিচে structuredভাবে দেওয়া হলো।`}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <DetailPanel tone="cyan" icon="◎" title="Primary job" label="Core use">
                  <p>{guide.primaryJob}</p>
                </DetailPanel>
                <DetailPanel tone="green" icon="✓" title="Best ROI" label="When it works">
                  <p>যখন একই ধরনের কাজ বারবার হয়, clear input থাকে, আর final output human review দিয়ে polish করা হয়।</p>
                </DetailPanel>
                <DetailPanel tone="orange" icon="!" title="Check first" label="Before buying">
                  <p>{getPricingNote(tool.pricing)}</p>
                </DetailPanel>
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader
                eyebrow="Company profile"
                title="Company, platform and usage signal"
                description="এই অংশটি tool selection-এর business side দেখায়: কোন platform, official domain কী, কোন workflow-এর জন্য উপযোগী এবং কোন risk আগে দেখা দরকার।"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                <DetailPanel tone="neutral" icon={company.code} title={company.company} label="Company / Platform">
                  <p>{company.productType}</p>
                </DetailPanel>
                <DetailPanel tone="cyan" icon="↗" title={host || "Official site"} label="Official domain">
                  <p>{host ? `Official link use করুন: ${host}` : "Website URL missing থাকলে verified source থেকে link add করা দরকার।"}</p>
                </DetailPanel>
                <DetailPanel tone="blue" icon="▣" title={categoryName} label="Tool category">
                  <p>{company.marketPosition}</p>
                </DetailPanel>
                <DetailPanel tone="rose" icon="◌" title="Data and billing caution" label="Trust note">
                  <p>{company.trustNote}</p>
                </DetailPanel>
              </div>
            </section>

            {tool.description_bn && (
              <section className="mb-8">
                <SectionHeader eyebrow="Deep review" title="বিস্তারিত রিভিউ" />
                <div className="glass-card p-5 sm:p-6">
                  <p className="text-base leading-9 text-gray-300">{tool.description_bn}</p>
                </div>
              </section>
            )}

            <section className="mb-8">
              <SectionHeader
                eyebrow="Output map"
                title="এই টুল দিয়ে কী ধরনের output পাবেন"
                description="Flat feature list না দেখে output ধরে চিন্তা করলে tool selection সহজ হয়। নিচের boxes গুলো real workflow-এর expected deliverable দেখায়।"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {expectedOutputs.map((item, index) => (
                  <DetailPanel key={item} tone={index % 3 === 0 ? "cyan" : index % 3 === 1 ? "green" : "orange"} icon={index + 1} title={item} label="Output">
                    <p>এই output সরাসরি publish না করে brief, brand tone এবং final QA দিয়ে polish করলে professional result পাওয়া যায়।</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader
                eyebrow="Workflow stack"
                title="Workflow-এর কোন ধাপে ব্যবহার করবেন"
                description={`${tool.name} একা পুরো business process replace করে না; input, AI work এবং QA layer ঠিক থাকলে result premium হয়।`}
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {stackFlow.map((item, index) => (
                  <NumberedPanel key={item.title} index={index + 1} title={item.title} text={item.text} tone={index === 0 ? "blue" : index === 1 ? "cyan" : "green"} />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader eyebrow="Best for" title="কাদের জন্য সবচেয়ে ভালো" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {bestFor.slice(0, 6).map((item: string, index: number) => (
                  <DetailPanel key={item} tone={index % 2 === 0 ? "green" : "cyan"} icon="✓" title={`Fit ${index + 1}`} label="User fit">
                    <p>{item}</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader
                eyebrow="Bangladesh use cases"
                title="বাংলাদেশি workflow-এ practical ব্যবহার"
                description="Freelancing, content, small business, agency operation এবং client delivery context ধরে ব্যবহার করলে tool-er value দ্রুত বোঝা যায়।"
              />
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {useCaseMatrix.map((item) => (
                  <DetailPanel key={item.title} tone={item.tone} icon="BD" title={item.title} label="Local workflow">
                    <p>{item.text}</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader
                eyebrow="Operating playbook"
                title="Premium workflow বানানোর step-by-step plan"
                description="শুধু tool খুলে prompt দিলে average result আসে। নিচের flow follow করলে reusable, measurable এবং client-ready workflow পাওয়া যায়।"
              />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {workflow.map((item: string, index: number) => (
                  <NumberedPanel key={item} index={index + 1} title={guide.workflowFocus[index] || `Step ${index + 1}`} text={item} tone={index % 2 === 0 ? "cyan" : "orange"} />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader eyebrow="Setup checklist" title="শুরু করার আগে যা সেট করবেন" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {setupSteps.map((item: string, index: number) => (
                  <NumberedPanel key={item} index={index + 1} title={index === 0 ? "Account and access" : index === 1 ? "Benchmark task" : index === 2 ? "Team settings" : "Template system"} text={item} tone={index % 2 === 0 ? "green" : "blue"} />
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader eyebrow="Quality control" title="Professional output পাওয়ার QA checklist" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {takeUnique(guide.qualityChecks, limitations, 6).map((item, index) => (
                  <DetailPanel key={item} tone={index % 3 === 0 ? "cyan" : index % 3 === 1 ? "green" : "rose"} icon="QA" title={`Check ${index + 1}`} label="Quality gate">
                    <p>{item}</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            {(pros.length > 0 || cons.length > 0) && (
              <section className="mb-8">
                <SectionHeader eyebrow="Pros and cons" title="সুবিধা, অসুবিধা এবং trade-off" />
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {pros.length > 0 && (
                    <div className="rounded-lg border border-emerald-400/20 bg-emerald-400/[0.055] p-5">
                      <h3 className="mb-4 text-lg font-extrabold text-emerald-200">সুবিধা</h3>
                      <div className="space-y-3">
                        {pros.map((item: string) => (
                          <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-black/10 p-3 text-sm leading-7 text-gray-300">
                            <span className="text-emerald-300">+</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {cons.length > 0 && (
                    <div className="rounded-lg border border-rose-400/20 bg-rose-400/[0.055] p-5">
                      <h3 className="mb-4 text-lg font-extrabold text-rose-200">অসুবিধা</h3>
                      <div className="space-y-3">
                        {cons.map((item: string) => (
                          <div key={item} className="flex gap-3 rounded-lg border border-white/10 bg-black/10 p-3 text-sm leading-7 text-gray-300">
                            <span className="text-rose-300">-</span>
                            <span>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </section>
            )}

            <section className="mb-8">
              <SectionHeader eyebrow="Buying guide" title="Paid plan নেওয়ার আগে decision checklist" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {selectionTips.map((item: string, index: number) => (
                  <DetailPanel key={item} tone={index === 0 ? "orange" : index === 1 ? "cyan" : "green"} icon="◆" title={index === 0 ? "Shortlist fit" : index === 1 ? "Policy and limit" : "Compare ROI"} label="Decision point">
                    <p>{item}</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            <section className="mb-8">
              <SectionHeader eyebrow="Limitations" title="যেখানে সাবধানে ব্যবহার করবেন" />
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {limitations.slice(0, 6).map((item: string, index: number) => (
                  <DetailPanel key={item} tone="rose" icon="!" title={`Risk ${index + 1}`} label="Review needed">
                    <p>{item}</p>
                  </DetailPanel>
                ))}
              </div>
            </section>

            {faq.length > 0 && (
              <section className="mb-8">
                <SectionHeader eyebrow="FAQ" title="সাধারণ প্রশ্ন" />
                <div className="space-y-3">
                  {faq.map((item: any, index: number) => (
                    <details key={index} className="group rounded-lg border border-white/10 bg-white/[0.035] p-4">
                      <summary className="cursor-pointer text-base font-bold text-gray-100 transition-colors group-open:text-cyan-100">{item.q}</summary>
                      <p className="mt-3 border-l-2 border-cyan-300/30 pl-4 text-sm leading-7 text-gray-400">{item.a}</p>
                    </details>
                  ))}
                </div>
              </section>
            )}
          </main>

          <aside className="space-y-5 lg:sticky lg:top-20 lg:self-start">
            <div className="glass-card glow-orange p-5">
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-orange-200/80">Official action</p>
              <h3 className="text-xl font-extrabold text-white">{tool.name} ব্যবহার করুন</h3>
              <p className="mt-2 text-sm leading-7 text-gray-400">{tool.pricing_detail || getPricingNote(tool.pricing)}</p>
              <div className="mt-5">
                {tool.affiliate_slug ? (
                  <Link href={`/go/${tool.affiliate_slug}`} target="_blank" className="btn-primary w-full text-center">
                    {tool.name} এ যান
                  </Link>
                ) : tool.website_url ? (
                  <a href={tool.website_url} target="_blank" rel="noopener noreferrer" className="btn-primary w-full text-center">
                    অফিসিয়াল ওয়েবসাইট দেখুন
                  </a>
                ) : null}
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-xs text-gray-500">Views</p>
                  <p className="text-sm font-bold text-white">{tool.view_count || 0}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-xs text-gray-500">Code</p>
                  <p className="text-sm font-bold text-white">{company.code}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-cyan-200/80">Quick verdict</p>
              <div className="space-y-3">
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-sm font-bold text-white">Choose if</p>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{bestFor[0]}</p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
                  <p className="text-sm font-bold text-white">Avoid/compare if</p>
                  <p className="mt-1 text-sm leading-6 text-gray-400">{limitations[0]}</p>
                </div>
              </div>
            </div>

            {alternatives.length > 0 && (
              <div className="glass-card p-5">
                <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-400">বিকল্প টুলস</p>
                <div className="space-y-3">
                  {alternatives.map((alt: any) => (
                    <Link key={alt.slug} href={`/tools/${alt.slug}`} className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/[0.03] p-3 transition-colors hover:border-cyan-300/30 hover:bg-white/[0.06]">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.06]">
                        {alt.logo_url ? <Image src={alt.logo_url} alt="" width={28} height={28} className="h-7 w-7 rounded object-contain" /> : <span className="text-xs font-black text-cyan-100">{getInitials(alt.name)}</span>}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-bold text-gray-200">{alt.name}</p>
                        <p className="line-clamp-2 text-xs leading-5 text-gray-500">{alt.tagline_bn}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="glass-card p-5">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.12em] text-gray-400">শেয়ার করুন</p>
              <div className="grid grid-cols-2 gap-2">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${base}/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-center text-xs">Facebook</a>
                <a href={`https://api.whatsapp.com/send?text=${tool.name} ${base}/tools/${tool.slug}`} target="_blank" rel="noopener noreferrer" className="btn-secondary text-center text-xs">WhatsApp</a>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
