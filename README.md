# BanglaAIHub — বাংলায় AI টুলস ও অনলাইন আয় প্ল্যাটফর্ম

Complete Next.js 14 platform + Python automation. Deploy to Vercel, connect Supabase, and start earning.

## What's Included

### Frontend (Next.js 14 + Tailwind)
- **Homepage** — hero, trending tools, categories, blog, deals, newsletter
- **Tools Directory** — `/tools` listing + `/tools/[slug]` detail with tracked CTA, alternatives, FAQ, schema
- **Blog** — `/blog` with category filter + trending sidebar + `/blog/[slug]` with reading progress, related posts, share
- **Categories** — listing + detail with tools
- **Compare, Top Lists, Guides** — listing + detail pages
- **Make Money** — money-making blog posts filtered
- **Deals** — listing + detail with coupon codes
- **Prompts** — library with copy button
- **Resources** — free downloads
- **Search** — full-text search across tools + blog
- **Glossary** — Bangla AI terminology
- **AI Tool Finder** — conversational quiz
- **Tracked Redirects** — `/go/[slug]` with click tracking
- **Newsletter** — signup page
- **Static Pages** — About, Contact, Privacy, Disclaimer, 404

### SEO
- Dynamic sitemap.xml
- robots.txt
- RSS feed (/feed.xml)
- Dynamic OG images per post/tool
- JSON-LD schema (Article, SoftwareApplication)
- Canonical URLs, breadcrumbs

### API Routes
- `/api/views/[slug]` — view count increment
- `/api/analytics` — protected dashboard stats
- `/api/og/[slug]` — dynamic social images
- `/api/health` — health check
- `/api/search` — internal search API
- `/feed.xml` — RSS

### Database (Supabase — 22 tables)
categories, tools, tool_alternatives, comparisons, top_lists, guides, blog_posts, deals, prompts, workflows, tracked link tables, scrape_queue, published_topics, social_posts, newsletter_subscribers, analytics_events, openclaw_jobs, openclaw_job_logs, site_settings, glossary, resources

### Python Automation (BanglaAIHub Automation)
- Reddit (16 subreddits) + X/Twitter + Hacker News + Product Hunt scraping
- OpenAI GPT-4o-mini Bangla rewriting
- Content quality scoring (A-F grading)
- Blog publish to Supabase
- Facebook auto-post (hook + first comment link)
- Telegram notifications + admin commands
- GitHub Actions cron with retries and job tracking

## Setup

### 1. Supabase
Run `supabase_migration.sql` in SQL Editor.

### 2. Install & Run
```bash
npm install
cp .env.local.example .env.local  # fill credentials
npm run dev
```

### 3. Vercel Deploy
```bash
git init && git add . && git commit -m "init"
# Create repo on GitHub, push, connect to Vercel
```

Add env vars in Vercel Dashboard → Settings → Environment Variables.

### 4. Automation
```bash
cd automation
pip install -r requirements.txt
python orchestrator.py  # test run
```

Add GitHub secrets, push — cron auto-runs 3x daily.

### 5. API Keys Needed

| Service | URL |
|---------|-----|
| Supabase | supabase.com |
| OpenAI | platform.openai.com/api-keys |
| Reddit | reddit.com/prefs/apps |
| X/Twitter | developer.twitter.com |
| Product Hunt | producthunt.com/v2/oauth/applications |
| Facebook Page | developers.facebook.com |
| Telegram Bot | @BotFather |
| Unsplash | unsplash.com/developers |

## Project Structure
```
banglaaihub/
├── app/
│   ├── layout.tsx, page.tsx, globals.css
│   ├── blog/ (listing + [slug] detail)
│   ├── tools/ (listing + [slug] detail)
│   ├── categories/ (listing + [slug])
│   ├── compare/ (listing + [slug])
│   ├── top-lists/ (listing + [slug])
│   ├── guides/ (listing + [slug])
│   ├── make-money/
│   ├── deals/ (listing + [slug])
│   ├── prompts/ (listing + [slug])
│   ├── resources/ (listing + [slug])
│   ├── find-tool/, glossary/, search/
│   ├── newsletter/, about/, contact/
│   ├── privacy/, disclaimer/
│   ├── go/[slug]/ (tracked redirect)
│   ├── feed.xml/, sitemap.ts, robots.ts
│   ├── not-found.tsx
│   └── api/ (views, analytics, og, health, search)
├── automation/
│   ├── agents/ (13 Python agents)
│   ├── orchestrator.py, config.py, utils.py
│   └── requirements.txt
├── components/ (Navbar, Footer)
├── lib/ (supabase.ts, constants.ts)
├── public/
├── package.json, tailwind.config.ts, etc.
├── supabase_migration.sql
└── .github/workflows/daily_run.yml
```
