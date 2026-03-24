# BanglaAIHub — Architecture & Setup Guide

## Stack
- **Web**: Next.js 14 (App Router) → Vercel
- **Admin**: Next.js 14 (App Router) → Vercel (separate project)
- **Database**: Supabase (PostgreSQL + RLS)
- **AI**: Claude claude-opus-4-20250514 (content generation)
- **Automation**: GitHub Actions (scheduler)
- **Images**: Unsplash API (free thumbnails)
- **Social**: Facebook Graph API

---

## Project Structure

```
banglaAIhub/
├── apps/web/          → Public website (banglaAIhub.com)
├── apps/admin/        → Admin dashboard (admin.banglaAIhub.com)
├── scripts/           → Automation scripts (run by GitHub Actions)
├── supabase/          → DB migrations
└── .github/workflows/ → Scheduled jobs
```

---

## Setup Steps

### 1. Supabase Setup
1. Create project at supabase.com
2. Go to SQL Editor
3. Run: `supabase/migrations/001_complete_schema.sql`
4. Copy URL and anon key

### 2. Web App (apps/web)
```bash
cd apps/web
cp .env.example .env.local
# Fill in SUPABASE keys
npm install
npm run dev
```

### 3. Admin App (apps/admin)
```bash
cd apps/admin
cp .env.example .env.local
# Fill in SUPABASE keys + ANTHROPIC_API_KEY
npm install
npm run dev
```

### 4. Vercel Deployment
- Deploy `apps/web` → banglaAIhub.com
- Deploy `apps/admin` → admin.banglaAIhub.com
- Add all env vars in Vercel dashboard

### 5. GitHub Actions Setup
Add these secrets in GitHub repo Settings → Secrets:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `ANTHROPIC_API_KEY`
- `PRODUCTHUNT_TOKEN` (optional)
- `SITE_URL`

### 6. Admin Settings Configuration
Go to admin.banglaAIhub.com/settings and fill:
- Facebook Page ID + Access Token
- Unsplash API Key
- Reddit API credentials
- Email alert address
- Daily post count + schedule times

---

## Facebook Graph API Setup

1. Go to developers.facebook.com
2. Create App → Business type
3. Add "Facebook Login" + "Pages API"
4. Get Page Access Token:
   - Go to Graph API Explorer
   - Select your page
   - Generate token with permissions:
     - `pages_manage_posts`
     - `pages_read_engagement`
     - `publish_to_groups` (if using groups)
5. Convert to long-lived token (60 days)
6. Add to Admin → Settings

---

## Affiliate Link System

1. Admin → Affiliate Links → Add New
2. Set slug (e.g. `chatgpt`) → creates `/go/chatgpt`
3. Add destination URL (your affiliate URL)
4. In blog posts, link to `/go/chatgpt` instead of direct URL
5. Tracks clicks automatically

---

## OpenClaw Schedule Control

Admin → Settings → OpenClaw Automation:
- Toggle on/off
- Set daily post count (1-20)
- Add/remove post times
- Adjust source weights

---

## Daily Flow

```
GitHub Actions (3x/day)
  → scripts/run-auto-pipeline.ts
    → Scrape Reddit + HN + ProductHunt + Nitter
    → Score & deduplicate topics
    → Save to scrape_queue table
    → Generate Bangla blog (Claude API)
    → Publish to blog_posts table
    → Generate Facebook hook (Claude API)
    → Post to Facebook Page
    → Comment blog link (5 min delay)
    → Log to openclaw_job_logs
```

---

## Manual Publish Flow

```
Admin → Quick Submit
  → Fill title + main idea
  → Select content type + style
  → Click Generate & Publish
    → Claude writes full Bangla blog
    → Auto publishes to site
    → Auto posts to Facebook
    → Comments blog link
```

---

## Important Notes After Audit

### Route Group Structure
The web app uses `(site)` route group — NOT `/site/`. This means:
- `apps/web/src/app/(site)/tools/page.tsx` → URL: `/tools`
- `apps/web/src/app/(site)/blog/page.tsx` → URL: `/blog`
- The `(site)` folder name is invisible in URLs (Next.js route groups)

### Admin API Security
Admin API routes use `x-admin-secret` header. Set `ADMIN_SECRET` in env.

### Client vs Server Components
- All pages with `useState/useEffect/onClick` have `'use client'` directive
- Server pages use `async function` + direct Supabase calls
- `CopyButton` component handles clipboard (client-side) separately

### Deployment
- Deploy `apps/web/` as one Vercel project → banglaAIhub.com
- Deploy `apps/admin/` as separate Vercel project → admin.banglaAIhub.com
- Both have their own `vercel.json` and `package.json`

### GitHub Actions
- Secrets needed: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `SITE_URL`
- Pipeline runs 3x daily via cron (BD timezone: 8am, 1pm, 9pm)
- Can also trigger manually via GitHub UI → Actions → "Run workflow"
