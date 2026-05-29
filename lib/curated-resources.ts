export type CuratedPrompt = {
  id: string;
  slug: string;
  title_bn: string;
  description_bn: string;
  tool_name: string;
  category: string;
  use_case_bn: string;
  prompt_text: string;
};

export type CuratedGuide = {
  id: string;
  slug: string;
  title_bn: string;
  description_bn: string;
  read_time_min: number;
  view_count: number;
  body_bn: string;
};

export type IncomeRoadmap = {
  slug: string;
  title: string;
  description: string;
  tools: string[];
  steps: string[];
  outcome: string;
};

export const CURATED_PROMPTS: CuratedPrompt[] = [
  {
    id: "curated-prompt-blog-outline",
    slug: "bangla-seo-blog-outline",
    title_bn: "বাংলা SEO ব্লগ আউটলাইন",
    description_bn: "কিওয়ার্ড থেকে সার্চ ইনটেন্ট, হেডিং, FAQ এবং practical বাংলা ব্লগ স্ট্রাকচার তৈরি করুন।",
    tool_name: "ChatGPT / Claude",
    category: "content",
    use_case_bn: "ব্লগ, affiliate review, tool comparison এবং tutorial article শুরু করার আগে outline বানাতে ব্যবহার করুন।",
    prompt_text: `আপনি একজন senior Bangla SEO editor।

Topic: [আপনার টপিক]
Primary keyword: [কিওয়ার্ড]
Audience: [কারা পড়বে]
Goal: [traffic / lead / affiliate sale / education]

আমাকে নিচের format-এ একটি detailed blog plan দিন:
1. Search intent analysis
2. ৫টি click-worthy Bangla title
3. Meta description, 150 characters এর মধ্যে
4. H1, H2, H3 সহ complete outline
5. প্রতিটি section-এ কী লিখতে হবে
6. বাংলাদেশি reader-এর জন্য practical examples
7. FAQ section, কমপক্ষে ৬টি প্রশ্ন
8. Internal link suggestion
9. Call-to-action

Tone: পরিষ্কার, practical, premium কিন্তু সহজ বাংলা।`,
  },
  {
    id: "curated-prompt-client-proposal",
    slug: "freelance-client-proposal",
    title_bn: "ফ্রিল্যান্স ক্লায়েন্ট প্রপোজাল",
    description_bn: "Client brief থেকে scope, timeline, deliverables এবং confident proposal তৈরি করুন।",
    tool_name: "ChatGPT / Gemini",
    category: "freelance",
    use_case_bn: "Upwork, Fiverr, Facebook group বা direct client pitch করার আগে tailored proposal লিখতে ব্যবহার করুন।",
    prompt_text: `আপনি একজন experienced freelance consultant।

Client brief:
[এখানে client-এর কাজের description দিন]

আমার skill:
[আপনার skill লিখুন]

আমাকে একটি professional proposal লিখে দিন:
- ২ লাইনের strong opening
- Client problem বুঝেছি এমন short analysis
- Proposed solution
- Deliverables list
- Timeline
- ৩টি relevant question
- Soft call-to-action

Proposal যেন generic না হয়। Tone confident, helpful এবং human হবে।`,
  },
  {
    id: "curated-prompt-social-calendar",
    slug: "social-media-content-calendar",
    title_bn: "৩০ দিনের সোশ্যাল কনটেন্ট ক্যালেন্ডার",
    description_bn: "নিশ, অফার এবং audience দিলে ৩০ দিনের post idea, hook ও CTA বানান।",
    tool_name: "ChatGPT / Claude",
    category: "marketing",
    use_case_bn: "Facebook page, LinkedIn profile, agency client বা personal brand-এর content planning-এর জন্য।",
    prompt_text: `আপনি একজন Bangla social media strategist।

Business/niche: [নিশ]
Target audience: [কারা]
Offer/service: [কি sell/educate করবেন]
Platform: [Facebook/LinkedIn/Instagram]

৩০ দিনের content calendar দিন table format-এ:
- Day
- Content angle
- Post hook
- Main message
- CTA
- Suggested visual idea

Content mix হবে: education, trust-building, proof, objection handling, soft sales, story, checklist।`,
  },
  {
    id: "curated-prompt-image-brief",
    slug: "ai-image-generation-brief",
    title_bn: "AI ইমেজ জেনারেশন ব্রিফ",
    description_bn: "Thumbnail, blog cover বা social visual-এর জন্য clean image prompt তৈরি করুন।",
    tool_name: "Midjourney / DALL-E / Ideogram",
    category: "design",
    use_case_bn: "Blog thumbnail, YouTube cover, ad creative এবং product visual বানানোর আগে।",
    prompt_text: `আপনি একজন art director।

আমি একটি image generate করতে চাই:
Subject: [মূল subject]
Use case: [blog cover / thumbnail / ad / social post]
Mood: [premium / friendly / futuristic / minimal]
Brand colors: [রং]
Text থাকবে কি না: [yes/no]

আমাকে ৫টি image prompt দিন:
1. Photorealistic version
2. Editorial illustration
3. Minimal product-style
4. High-conversion ad creative
5. Bengali audience-friendly version

প্রতিটি prompt-এ composition, lighting, background, camera/style এবং negative prompt থাকবে।`,
  },
  {
    id: "curated-prompt-youtube-script",
    slug: "youtube-shorts-script",
    title_bn: "YouTube Shorts / Reels Script",
    description_bn: "একটি topic থেকে hook, scene plan, voiceover এবং CTA সহ short video script বানান।",
    tool_name: "ChatGPT / Gemini",
    category: "video",
    use_case_bn: "Short-form content, AI tool review, tutorial teaser বা income tips ভিডিওর জন্য।",
    prompt_text: `আপনি একজন short-form video scriptwriter।

Topic: [ভিডিও টপিক]
Audience: [কারা দেখবে]
Duration: [30/45/60 seconds]
Goal: [educate / sell / grow followers]

Script দিন:
- ৩টি hook option
- Scene-by-scene plan
- Voiceover line
- On-screen text
- B-roll/visual suggestion
- Ending CTA

ভাষা হবে natural Bangla, fast-paced, no fluff।`,
  },
  {
    id: "curated-prompt-automation-sop",
    slug: "automation-sop-builder",
    title_bn: "Automation SOP Builder",
    description_bn: "যে repetitive কাজ automate করতে চান, সেটার workflow, trigger, tools এবং error handling plan করুন।",
    tool_name: "ChatGPT / Claude",
    category: "automation",
    use_case_bn: "n8n, Zapier, Make বা custom automation বানানোর আগে process পরিষ্কার করার জন্য।",
    prompt_text: `আপনি একজন automation systems architect।

Manual task:
[কাজের description]

Current tools:
[যে tools ব্যবহার করি]

আমাকে একটি automation SOP বানিয়ে দিন:
1. Goal
2. Trigger
3. Required input data
4. Step-by-step workflow
5. Suggested tools
6. Error handling
7. Human approval step
8. Success metric
9. Future improvement

Output যেন developer এবং non-technical business owner দুজনই বুঝতে পারে।`,
  },
];

export const CURATED_GUIDES: CuratedGuide[] = [
  {
    id: "curated-guide-tool-checklist",
    slug: "ai-tool-selection-checklist",
    title_bn: "AI টুল বাছাই করার প্র্যাক্টিক্যাল চেকলিস্ট",
    description_bn: "দাম, privacy, output quality, learning curve এবং business fit দেখে সঠিক AI tool বাছাই করুন।",
    read_time_min: 8,
    view_count: 0,
    body_bn: `## কেন চেকলিস্ট দরকার

AI tool দেখলেই subscribe করলে খরচ বাড়ে, কিন্তু workflow উন্নত হয় না। ভালো tool বাছাই করার আগে কাজ, budget, data sensitivity এবং output quality পরিষ্কার করা জরুরি।

## ১. Use case লিখে নিন

প্রথমে লিখুন tool দিয়ে আপনি কী করবেন: writing, research, image, video, automation, coding, customer support, না analytics। একই tool সব কাজে best হবে না।

## ২. Output quality test করুন

একই prompt তিনবার চালান। দেখুন answer consistent কি না, Bangla output natural কি না, ভুল তথ্য দেয় কি না, এবং edit করতে কত সময় লাগে।

## ৩. Pricing বুঝুন

Free plan থাকলেই সেটি long-term free না। Limit, watermark, export quality, commercial use, team seat এবং API cost দেখে সিদ্ধান্ত নিন।

## ৪. Data privacy যাচাই করুন

Client document, customer data, business plan বা private code দিলে tool-এর data policy পড়ুন। Sensitive কাজের জন্য self-hosted বা enterprise-safe option ভাবুন।

## ৫. Workflow fit দেখুন

Tool কি আপনার existing কাজের সাথে fit করে? Export আছে? Chrome extension আছে? API আছে? Team collaboration আছে? না থাকলে manual copy-paste বাড়বে।

## Quick scoring

প্রতিটি tool-কে ১-৫ score দিন:

| Criteria | Score |
| --- | --- |
| Output quality |  |
| Bangla support |  |
| Pricing value |  |
| Privacy |  |
| Workflow fit |  |
| Learning curve |  |

## Final rule

যে tool সপ্তাহে অন্তত ৩ ঘন্টা বাঁচায় বা directly revenue বাড়ায়, সেটাই paid plan নেওয়ার জন্য strong candidate।`,
  },
  {
    id: "curated-guide-content-workflow",
    slug: "bangla-ai-content-workflow",
    title_bn: "বাংলা কনটেন্ট তৈরির AI Workflow",
    description_bn: "Research থেকে publish পর্যন্ত blog, Facebook post ও newsletter বানানোর repeatable workflow।",
    read_time_min: 10,
    view_count: 0,
    body_bn: `## Workflow overview

ভালো content শুধু AI দিয়ে লেখা নয়। ভালো workflow হলো research, structure, draft, edit, fact-check, visual এবং distribution একসাথে করা।

## Step 1: Topic validation

Topic নেওয়ার আগে audience pain, search demand এবং business goal লিখুন। একটি topic যদি reader-এর real problem solve না করে, সেটা publish করলেও impact কম হবে।

## Step 2: Research pack তৈরি

AI-কে বলুন source, competing angle, common objections এবং FAQ বের করতে। তারপর গুরুত্বপূর্ণ facts manually verify করুন।

## Step 3: Outline আগে, draft পরে

সরাসরি full article লিখতে বললে structure দুর্বল হয়। আগে H2/H3 outline, key points, examples এবং CTA approve করুন।

## Step 4: Bangla editing pass

AI output-এ প্রায়ই generic শব্দ থাকে। Edit pass-এ sentence ছোট করুন, English term দরকার হলে রাখুন, কিন্তু explanation বাংলায় দিন।

## Step 5: Visual plan

প্রতিটি article/post-এর জন্য thumbnail idea, section image idea এবং social preview বানান। Visual content click-through বাড়ায়।

## Step 6: Repurpose

একটি blog থেকে বানান:

- ৩টি Facebook post
- ১টি LinkedIn post
- ৫টি short video hook
- ১টি email newsletter
- ১টি carousel outline

## Publishing checklist

- Title clear?
- Meta description আছে?
- Internal link আছে?
- CTA আছে?
- Screenshot/image optimized?
- Mobile view readable?

এই workflow follow করলে content output শুধু বেশি হবে না, quality ও consistent থাকবে।`,
  },
  {
    id: "curated-guide-automation",
    slug: "ai-automation-starter-guide",
    title_bn: "AI Automation শুরু করার গাইড",
    description_bn: "কোন কাজ automate করবেন, কীভাবে trigger/action map করবেন এবং কোন tools ব্যবহার করবেন।",
    read_time_min: 12,
    view_count: 0,
    body_bn: `## Automation মানে কী

Automation মানে সবকিছু AI-কে দিয়ে দেওয়া নয়। Automation মানে repetitive কাজের clear rule বানিয়ে trigger, action, review এবং result tracking set করা।

## কোন কাজ আগে automate করবেন

যে কাজ repeat হয়, low-risk, clear input-output আছে এবং manual করলে সময় লাগে, সেটি আগে automate করুন। যেমন lead collection, report summary, email draft, social post scheduling।

## Basic structure

একটি automation সাধারণত ৫ অংশে ভাগ হয়:

1. Trigger: কখন workflow শুরু হবে
2. Input: কোন data লাগবে
3. Processing: AI বা logic কী করবে
4. Review: human approval লাগবে কি না
5. Output: কোথায় result যাবে

## Tool options

- n8n: self-hosted এবং advanced workflow
- Zapier: সহজ setup, অনেক integration
- Make: visual workflow builder
- Google Sheets: lightweight database
- ChatGPT/Claude: text processing, summary, classification

## Example workflow

Lead form submit হলে data Google Sheets-এ যাবে। AI lead category assign করবে। High-value lead হলে email draft তৈরি হবে। Owner approve করলে Gmail দিয়ে reply যাবে।

## Safety rules

Payment, legal, medical, private data বা public posting-এর আগে human approval রাখুন। Automation ভুল করলে damage দ্রুত scale করে।

## Success metric

Automation successful কিনা মাপুন:

- প্রতি সপ্তাহে কত ঘন্টা বাঁচছে
- error rate কত
- response time কত কমেছে
- revenue বা lead conversion improve করছে কি না

Small workflow দিয়ে শুরু করুন, তারপর ধীরে ধীরে expand করুন।`,
  },
  {
    id: "curated-guide-prompt-framework",
    slug: "premium-prompt-writing-framework",
    title_bn: "ভালো Prompt লেখার Framework",
    description_bn: "Role, context, output format, constraints এবং examples দিয়ে predictable AI output নিন।",
    read_time_min: 7,
    view_count: 0,
    body_bn: `## ভালো prompt কেন দরকার

AI tool ভালো হলেও unclear prompt দিলে output generic হবে। ভালো prompt AI-কে role, context, goal, constraints এবং expected format দেয়।

## Formula

একটি strong prompt-এর structure:

1. Role: AI কোন expert হিসেবে কাজ করবে
2. Context: কাজের background
3. Goal: কী output চান
4. Input: data বা brief
5. Constraints: tone, length, language, avoid list
6. Format: table, bullet, JSON, markdown
7. Quality bar: কীভাবে output evaluate হবে

## Example

আপনি একজন Bangla SaaS copywriter। নিচের product details থেকে landing page copy লিখুন। Tone হবে clear, premium, no hype। Output দিন: headline, subheadline, ৫টি benefit, ৩টি objection answer, CTA।

## Iteration rule

প্রথম output final না ধরে improve করুন:

- আরও specific করো
- Bangla আরও natural করো
- example যোগ করো
- unnecessary claim বাদ দাও
- table format করো

## Common mistake

শুধু "একটা ভালো পোস্ট লিখে দাও" বললে predictable result পাবেন না। Input যত clear, output তত useful।`,
  },
];

export const INCOME_ROADMAPS: IncomeRoadmap[] = [
  {
    slug: "freelance-ai-service-package",
    title: "AI দিয়ে Freelance Service Package",
    description: "Writing, design, research বা automation skill নিয়ে sellable service package বানানোর roadmap।",
    tools: ["ChatGPT", "Canva", "Notion", "Google Docs"],
    steps: ["একটি niche বাছুন", "৩টি fixed deliverable define করুন", "sample output বানান", "proposal template তৈরি করুন", "৫ জন potential client-কে pitch করুন"],
    outcome: "৭ দিনের মধ্যে portfolio-ready service offer তৈরি হবে।",
  },
  {
    slug: "content-monetization-system",
    title: "Content থেকে Income System",
    description: "Blog, Facebook, YouTube Shorts বা newsletter দিয়ে audience build করে income channel তৈরি করুন।",
    tools: ["ChatGPT", "Canva", "CapCut", "Google Sheets"],
    steps: ["একটি topic pillar বাছুন", "৩০ দিনের content calendar বানান", "প্রতিটি content-এ CTA দিন", "affiliate/tool/resource link track করুন", "weekly performance review করুন"],
    outcome: "Consistent content engine এবং monetization funnel তৈরি হবে।",
  },
  {
    slug: "small-business-automation-service",
    title: "Local Business Automation Service",
    description: "ছোট business-এর lead, invoice, booking বা customer reply automate করে paid service দিন।",
    tools: ["n8n", "Google Sheets", "WhatsApp Business", "Gmail"],
    steps: ["একটি repetitive problem identify করুন", "before/after workflow map করুন", "demo automation বানান", "monthly support price set করুন", "local business owner-দের demo দেখান"],
    outcome: "Recurring income-এর জন্য automation service offer তৈরি হবে।",
  },
];

export function getCuratedPromptBySlug(slug: string) {
  return CURATED_PROMPTS.find((prompt) => prompt.slug === slug) || null;
}

export function getCuratedGuideBySlug(slug: string) {
  return CURATED_GUIDES.find((guide) => guide.slug === slug) || null;
}
