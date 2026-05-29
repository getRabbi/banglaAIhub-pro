import fs from "node:fs";
import path from "node:path";

function loadEnv() {
  const envPath = path.join(process.cwd(), ".env");
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#") || !trimmed.includes("=")) continue;
    const index = trimmed.indexOf("=");
    const key = trimmed.slice(0, index).trim();
    const value = trimmed.slice(index + 1).trim();
    if (!process.env[key]) process.env[key] = value;
  }
}

const prompts = [
  {
    title: "বাংলা SEO ব্লগ আউটলাইন",
    title_bn: "বাংলা SEO ব্লগ আউটলাইন",
    slug: "bangla-seo-blog-outline",
    description_bn: "কিওয়ার্ড থেকে সার্চ ইনটেন্ট, হেডিং, FAQ এবং practical বাংলা ব্লগ স্ট্রাকচার তৈরি করুন।",
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
    category: "content",
    tool_name: "ChatGPT / Claude",
    use_case: "SEO blog planning",
    use_case_bn: "ব্লগ, affiliate review, tool comparison এবং tutorial article শুরু করার আগে outline বানাতে ব্যবহার করুন।",
    is_active: true,
    is_published: true,
  },
  {
    title: "ফ্রিল্যান্স ক্লায়েন্ট প্রপোজাল",
    title_bn: "ফ্রিল্যান্স ক্লায়েন্ট প্রপোজাল",
    slug: "freelance-client-proposal",
    description_bn: "Client brief থেকে scope, timeline, deliverables এবং confident proposal তৈরি করুন।",
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
    category: "freelance",
    tool_name: "ChatGPT / Gemini",
    use_case: "Client proposal writing",
    use_case_bn: "Upwork, Fiverr, Facebook group বা direct client pitch করার আগে tailored proposal লিখতে ব্যবহার করুন।",
    is_active: true,
    is_published: true,
  },
  {
    title: "Automation SOP Builder",
    title_bn: "Automation SOP Builder",
    slug: "automation-sop-builder",
    description_bn: "Repetitive কাজ automate করার আগে trigger, tools, human approval এবং error handling plan করুন।",
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
    category: "automation",
    tool_name: "ChatGPT / Claude",
    use_case: "Automation planning",
    use_case_bn: "n8n, Zapier, Make বা custom automation বানানোর আগে process পরিষ্কার করার জন্য।",
    is_active: true,
    is_published: true,
  },
];

const guides = [
  {
    title: "AI Tool Selection Checklist",
    title_bn: "AI টুল বাছাই করার প্র্যাক্টিক্যাল চেকলিস্ট",
    slug: "ai-tool-selection-checklist",
    description_bn: "দাম, privacy, output quality, learning curve এবং business fit দেখে সঠিক AI tool বাছাই করুন।",
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

## Final rule

যে tool সপ্তাহে অন্তত ৩ ঘন্টা বাঁচায় বা directly revenue বাড়ায়, সেটাই paid plan নেওয়ার জন্য strong candidate।`,
    difficulty: "beginner",
    read_time_min: 8,
    meta_title: "AI টুল বাছাই করার চেকলিস্ট",
    meta_description: "বাংলাভাষী ব্যবহারকারীদের জন্য practical AI tool selection checklist।",
    is_active: true,
    is_published: true,
  },
  {
    title: "Bangla AI Content Workflow",
    title_bn: "বাংলা কনটেন্ট তৈরির AI Workflow",
    slug: "bangla-ai-content-workflow",
    description_bn: "Research থেকে publish পর্যন্ত blog, Facebook post ও newsletter বানানোর repeatable workflow।",
    body_bn: `## Workflow overview

ভালো content শুধু AI দিয়ে লেখা নয়। ভালো workflow হলো research, structure, draft, edit, fact-check, visual এবং distribution একসাথে করা।

## Step 1: Topic validation

Topic নেওয়ার আগে audience pain, search demand এবং business goal লিখুন। একটি topic যদি reader-এর real problem solve না করে, সেটা publish করলেও impact কম হবে।

## Step 2: Research pack তৈরি

AI-কে বলুন source, competing angle, common objections এবং FAQ বের করতে। তারপর গুরুত্বপূর্ণ facts manually verify করুন।

## Step 3: Outline আগে, draft পরে

সরাসরি full article লিখতে বললে structure দুর্বল হয়। আগে H2/H3 outline, key points, examples এবং CTA approve করুন।

## Step 4: Repurpose

একটি blog থেকে ৩টি Facebook post, ১টি LinkedIn post, ৫টি short video hook, ১টি email newsletter এবং ১টি carousel outline বানান।`,
    difficulty: "beginner",
    read_time_min: 10,
    meta_title: "বাংলা AI Content Workflow",
    meta_description: "AI দিয়ে বাংলা কনটেন্ট তৈরি ও repurpose করার complete workflow।",
    is_active: true,
    is_published: true,
  },
  {
    title: "AI Automation Starter Guide",
    title_bn: "AI Automation শুরু করার গাইড",
    slug: "ai-automation-starter-guide",
    description_bn: "কোন কাজ automate করবেন, কীভাবে trigger/action map করবেন এবং কোন tools ব্যবহার করবেন।",
    body_bn: `## Automation মানে কী

Automation মানে সবকিছু AI-কে দিয়ে দেওয়া নয়। Automation মানে repetitive কাজের clear rule বানিয়ে trigger, action, review এবং result tracking set করা।

## কোন কাজ আগে automate করবেন

যে কাজ repeat হয়, low-risk, clear input-output আছে এবং manual করলে সময় লাগে, সেটি আগে automate করুন। যেমন lead collection, report summary, email draft, social post scheduling।

## Basic structure

1. Trigger: কখন workflow শুরু হবে
2. Input: কোন data লাগবে
3. Processing: AI বা logic কী করবে
4. Review: human approval লাগবে কি না
5. Output: কোথায় result যাবে

## Safety rules

Payment, private data বা public posting-এর আগে human approval রাখুন। Automation ভুল করলে damage দ্রুত scale করে।`,
    difficulty: "beginner",
    read_time_min: 12,
    meta_title: "AI Automation শুরু করার গাইড",
    meta_description: "AI automation workflow শুরু করার practical guide।",
    is_active: true,
    is_published: true,
  },
];

const blogPosts = [
  {
    source: "manual",
    source_url: "",
    original_title: "AI diye freelance service package",
    title_bn: "AI দিয়ে Freelance Service Package বানানোর গাইড",
    bangla_title: "AI দিয়ে Freelance Service Package বানানোর গাইড",
    body_bn: `## কেন service package দরকার

Freelancing শুরু করতে অনেকেই শুধু skill list করে। কিন্তু client skill কিনে না, client outcome কিনে। তাই AI দিয়ে কাজ করতে চাইলে একটি clear service package দরকার।

## কোন service বাছবেন

প্রথমে এমন কাজ বাছুন যা AI দিয়ে দ্রুত করা যায় কিন্তু human judgment দরকার। উদাহরণ: blog outline, social content calendar, product description, research summary, presentation draft, automation setup।

## Package structure

একটি starter package এ রাখুন:

- Deliverable কী
- কত দিনে দিবেন
- client কী input দিবে
- revision কতবার
- final format কী হবে

## Sample offer

"আমি আপনার business-এর জন্য ৩০ দিনের Facebook content calendar তৈরি করব, যেখানে hook, caption, CTA এবং visual idea থাকবে। Delivery: ৩ দিন।"

## Tools

ChatGPT বা Claude দিয়ে draft, Canva দিয়ে visual direction, Google Docs দিয়ে delivery, Notion দিয়ে template রাখতে পারেন।

## Client pitch

Pitch করার সময় নিজের tool knowledge নয়, client-এর result explain করুন। বলুন কীভাবে সময় বাঁচবে, content consistency বাড়বে বা lead generation improve হবে।

## Final checklist

- sample output আছে
- package scope clear
- price fixed
- delivery timeline realistic
- revision policy আছে

এভাবে package করলে client বুঝতে পারে সে কী পাবে, আর আপনিও কাজ repeatableভাবে deliver করতে পারবেন।`,
    bangla_body: `## কেন service package দরকার

Freelancing শুরু করতে অনেকেই শুধু skill list করে। কিন্তু client skill কিনে না, client outcome কিনে। তাই AI দিয়ে কাজ করতে চাইলে একটি clear service package দরকার।

## কোন service বাছবেন

প্রথমে এমন কাজ বাছুন যা AI দিয়ে দ্রুত করা যায় কিন্তু human judgment দরকার। উদাহরণ: blog outline, social content calendar, product description, research summary, presentation draft, automation setup।

## Package structure

একটি starter package এ রাখুন:

- Deliverable কী
- কত দিনে দিবেন
- client কী input দিবে
- revision কতবার
- final format কী হবে

## Sample offer

"আমি আপনার business-এর জন্য ৩০ দিনের Facebook content calendar তৈরি করব, যেখানে hook, caption, CTA এবং visual idea থাকবে। Delivery: ৩ দিন।"

## Tools

ChatGPT বা Claude দিয়ে draft, Canva দিয়ে visual direction, Google Docs দিয়ে delivery, Notion দিয়ে template রাখতে পারেন।

## Client pitch

Pitch করার সময় নিজের tool knowledge নয়, client-এর result explain করুন। বলুন কীভাবে সময় বাঁচবে, content consistency বাড়বে বা lead generation improve হবে।

## Final checklist

- sample output আছে
- package scope clear
- price fixed
- delivery timeline realistic
- revision policy আছে`,
    hook_bn: "AI দিয়ে freelance service package বানাতে চান? Skill list না, client outcome sell করার practical structure এখানে।",
    bangla_hook: "AI দিয়ে freelance service package বানাতে চান? Skill list না, client outcome sell করার practical structure এখানে।",
    slug: "ai-freelance-service-package-guide",
    blog_slug: "ai-freelance-service-package-guide",
    category: "money-making",
    tags: ["money-making", "freelance", "ai-service"],
    meta_title: "AI দিয়ে Freelance Service Package বানানোর গাইড",
    meta_description: "AI tools ব্যবহার করে freelance service package বানানোর practical Bangla guide।",
    read_time_min: 5,
    status: "published",
    is_published: true,
    published_at: new Date().toISOString(),
  },
  {
    source: "manual",
    original_title: "AI content monetization workflow",
    title_bn: "AI Content Workflow দিয়ে অনলাইনে আয় করার Roadmap",
    bangla_title: "AI Content Workflow দিয়ে অনলাইনে আয় করার Roadmap",
    body_bn: `## Content থেকে আয় কীভাবে আসে

Content থেকে income একদিনে আসে না। Audience build, trust, useful resource এবং monetization path একসাথে কাজ করে।

## Niche বাছাই

AI tools, freelancing, productivity, small business automation বা design workflow-এর মতো niche বাছুন যেখানে মানুষ problem solve করতে চায়।

## ৩০ দিনের plan

প্রথম ৩০ দিনে focus করুন consistency-তে:

1. সপ্তাহে ৩টি educational post
2. সপ্তাহে ১টি tool review
3. সপ্তাহে ১টি case study
4. সপ্তাহে ১টি offer বা resource post

## Repurpose system

একটি blog থেকে short video script, Facebook post, LinkedIn post এবং email newsletter বানান। এতে একই research থেকে multiple platform coverage হয়।

## Monetization

Audience তৈরি হলে affiliate link, paid template, consultation, service package বা newsletter sponsorship add করতে পারেন।

## Tracking

Google Sheets-এ content topic, publish date, clicks, leads এবং revenue track করুন। যে topic result দেয় সেটাই বেশি publish করুন।`,
    bangla_body: `## Content থেকে আয় কীভাবে আসে

Content থেকে income একদিনে আসে না। Audience build, trust, useful resource এবং monetization path একসাথে কাজ করে।

## Niche বাছাই

AI tools, freelancing, productivity, small business automation বা design workflow-এর মতো niche বাছুন যেখানে মানুষ problem solve করতে চায়।

## ৩০ দিনের plan

প্রথম ৩০ দিনে focus করুন consistency-তে:

1. সপ্তাহে ৩টি educational post
2. সপ্তাহে ১টি tool review
3. সপ্তাহে ১টি case study
4. সপ্তাহে ১টি offer বা resource post

## Repurpose system

একটি blog থেকে short video script, Facebook post, LinkedIn post এবং email newsletter বানান। এতে একই research থেকে multiple platform coverage হয়।

## Monetization

Audience তৈরি হলে affiliate link, paid template, consultation, service package বা newsletter sponsorship add করতে পারেন।`,
    hook_bn: "AI দিয়ে content বানিয়ে income করতে চাইলে শুধু পোস্ট করলেই হবে না। দরকার workflow, tracking আর monetization path।",
    bangla_hook: "AI দিয়ে content বানিয়ে income করতে চাইলে শুধু পোস্ট করলেই হবে না। দরকার workflow, tracking আর monetization path।",
    slug: "ai-content-workflow-income-roadmap",
    blog_slug: "ai-content-workflow-income-roadmap",
    category: "money-making",
    tags: ["money-making", "content", "monetization"],
    meta_title: "AI Content Workflow দিয়ে অনলাইনে আয়",
    meta_description: "AI content workflow দিয়ে audience build ও monetization করার Bangla roadmap।",
    read_time_min: 4,
    status: "published",
    is_published: true,
    published_at: new Date().toISOString(),
  },
  {
    source: "manual",
    original_title: "Local business automation income",
    title_bn: "Local Business Automation Service দিয়ে Recurring Income",
    bangla_title: "Local Business Automation Service দিয়ে Recurring Income",
    body_bn: `## কেন local automation service

অনেক ছোট business lead, booking, invoice, customer reply এবং reporting manually করে। এগুলো automate করে monthly service হিসেবে offer করা যায়।

## কোন problem বাছবেন

এমন problem বাছুন যেটা business owner প্রতিদিন face করে। যেমন Facebook lead থেকে Google Sheet update, customer inquiry reply draft, appointment reminder, weekly sales report।

## Demo বানান

একটি simple demo বানান: form submit হলে sheet update হবে, AI lead category দিবে, তারপর email/WhatsApp reply draft তৈরি হবে।

## Pricing idea

Setup fee + monthly support model use করতে পারেন। Monthly support-এ monitoring, small change এবং error fix রাখুন।

## Tools

n8n, Make, Zapier, Google Sheets, Gmail, WhatsApp Business এবং ChatGPT/Claude API দিয়ে শুরু করা যায়।

## Sales pitch

Owner-কে automation jargon বলবেন না। বলুন: "আপনার lead miss কমবে, reply speed বাড়বে, এবং weekly report automatic হবে।"`,
    bangla_body: `## কেন local automation service

অনেক ছোট business lead, booking, invoice, customer reply এবং reporting manually করে। এগুলো automate করে monthly service হিসেবে offer করা যায়।

## কোন problem বাছবেন

এমন problem বাছুন যেটা business owner প্রতিদিন face করে। যেমন Facebook lead থেকে Google Sheet update, customer inquiry reply draft, appointment reminder, weekly sales report।

## Demo বানান

একটি simple demo বানান: form submit হলে sheet update হবে, AI lead category দিবে, তারপর email/WhatsApp reply draft তৈরি হবে।

## Pricing idea

Setup fee + monthly support model use করতে পারেন। Monthly support-এ monitoring, small change এবং error fix রাখুন।

## Tools

n8n, Make, Zapier, Google Sheets, Gmail, WhatsApp Business এবং ChatGPT/Claude API দিয়ে শুরু করা যায়।`,
    hook_bn: "ছোট business automation করে recurring income করতে চান? Lead, reply, report automation দিয়ে শুরু করতে পারেন।",
    bangla_hook: "ছোট business automation করে recurring income করতে চান? Lead, reply, report automation দিয়ে শুরু করতে পারেন।",
    slug: "local-business-automation-recurring-income",
    blog_slug: "local-business-automation-recurring-income",
    category: "money-making",
    tags: ["money-making", "automation", "local-business"],
    meta_title: "Local Business Automation Service দিয়ে Recurring Income",
    meta_description: "Small business automation service দিয়ে monthly recurring income করার guide।",
    read_time_min: 4,
    status: "published",
    is_published: true,
    published_at: new Date().toISOString(),
  },
];

for (const post of blogPosts) {
  post.title = post.title_bn;
  post.content_bn = post.body_bn;
  post.excerpt_bn = post.hook_bn;
  post.source_platform = post.source;
  post.reading_time_minutes = post.read_time_min;
}

loadEnv();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error("Missing Supabase URL or service key.");
  process.exit(1);
}

function missingColumn(message) {
  const patterns = [
    /Could not find the '([^']+)' column/i,
    /column "([^"]+)" of relation/i,
    /column ([a-zA-Z0-9_]+) does not exist/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function withoutColumn(rows, column) {
  return rows.map((row) => {
    const next = { ...row };
    delete next[column];
    return next;
  });
}

function alignRows(rows) {
  const keys = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  return rows.map((row) => Object.fromEntries(keys.map((key) => [key, row[key] ?? null])));
}

async function postgrestUpsert(table, rows, conflictColumn) {
  const url = new URL(`/rest/v1/${table}`, supabaseUrl);
  url.searchParams.set("on_conflict", conflictColumn);
  const response = await fetch(url, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=representation",
    },
    body: JSON.stringify(alignRows(rows)),
  });

  const text = await response.text();
  let payload = null;
  try {
    payload = text ? JSON.parse(text) : null;
  } catch {
    payload = text;
  }

  if (!response.ok) {
    const detail = typeof payload === "string" ? payload : JSON.stringify(payload);
    throw new Error(detail);
  }

  return payload || [];
}

async function upsertAdaptive(table, rows, conflictColumn = "slug") {
  let currentRows = rows;
  let currentConflict = conflictColumn;
  const removed = new Set();

  for (let attempt = 0; attempt < 24; attempt += 1) {
    try {
      const result = await postgrestUpsert(table, currentRows, currentConflict);
      console.log(`${table}: upserted ${Array.isArray(result) ? result.length : rows.length} rows`);
      if (removed.size) console.log(`${table}: skipped columns ${Array.from(removed).join(", ")}`);
      return result;
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (/Could not find the table/i.test(message)) {
        console.warn(`${table}: table missing, skipped`);
        return [];
      }
      const column = missingColumn(message);
      if (column && currentRows.some((row) => Object.prototype.hasOwnProperty.call(row, column))) {
        removed.add(column);
        currentRows = withoutColumn(currentRows, column);
        if (column === currentConflict && table === "blog_posts" && currentRows.some((row) => row.blog_slug)) {
          currentConflict = "blog_slug";
        }
        continue;
      }
      if (table === "blog_posts" && currentConflict === "slug" && /on_conflict|schema cache|slug/i.test(message)) {
        currentConflict = "blog_slug";
        continue;
      }
      throw error;
    }
  }

  throw new Error(`${table}: too many adaptive retries`);
}

await upsertAdaptive("prompts", prompts);
await upsertAdaptive("guides", guides);
await upsertAdaptive("blog_posts", blogPosts);

console.log("Seed complete.");
