-- ============================================
-- BanglaAIHub Complete Database Schema v1.0
-- ============================================

create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";

-- ============================================
-- ENUMS
-- ============================================
create type pricing_type as enum ('free', 'freemium', 'paid', 'open_source');
create type content_status as enum ('draft', 'published', 'archived', 'failed');
create type social_status as enum ('pending', 'posted', 'failed', 'skipped', 'scheduled');
create type content_type as enum ('tool_review', 'comparison', 'top_list', 'guide', 'blog', 'deal', 'money_making', 'resource');
create type source_platform as enum ('reddit', 'x', 'producthunt', 'hackernews', 'manual');
create type job_status as enum ('pending', 'running', 'completed', 'failed', 'cancelled');

-- ============================================
-- SITE SETTINGS
-- ============================================
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  key text unique not null,
  value jsonb not null,
  description text,
  updated_at timestamptz default now()
);

insert into site_settings (key, value, description) values
  ('openclaw_enabled', 'true', 'OpenClaw automation on/off'),
  ('daily_post_count', '3', 'Number of posts per day'),
  ('post_schedule_times', '["08:00", "13:00", "21:00"]', 'Post times in BD timezone (HH:MM)'),
  ('source_weights', '{"reddit": 40, "hackernews": 25, "producthunt": 25, "nitter": 10}', 'Source priority weights'),
  ('min_word_count', '800', 'Minimum blog post word count'),
  ('keyword_blacklist', '["crypto", "bitcoin", "gambling", "adult", "nsfw"]', 'Topics to avoid'),
  ('facebook_page_id', '""', 'Facebook Page ID'),
  ('facebook_access_token', '""', 'Facebook Page Access Token'),
  ('facebook_comment_delay_minutes', '5', 'Minutes to wait before posting link in comment'),
  ('unsplash_access_key', '""', 'Unsplash API Key for thumbnails'),
  ('gemini_api_key', '""', 'Gemini API Key for content generation'),
  ('reddit_client_id', '""', 'Reddit API Client ID'),
  ('reddit_client_secret', '""', 'Reddit API Client Secret'),
  ('affiliate_disclosure_text', '"এই পোস্টে affiliate link থাকতে পারে। আপনি এই লিংক ব্যবহার করে কিছু কিনলে আমরা কমিশন পাই।"', 'Affiliate disclosure notice'),
  ('default_facebook_hashtags', '["#AI", "#ArtificialIntelligence", "#বাংলাAI", "#AITools", "#BanglaAIHub"]', 'Default hashtags for FB posts'),
  ('email_alert_address', '""', 'Email for error alerts'),
  ('site_url', '"https://banglaAIhub.com"', 'Public site URL'),
  ('admin_url', '"https://admin.banglaAIhub.com"', 'Admin site URL');

-- ============================================
-- CATEGORIES
-- ============================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name_en text not null,
  name_bn text not null,
  slug text unique not null,
  description_bn text,
  icon text default '🤖',
  color text default '#4d9fff',
  parent_id uuid references categories(id),
  sort_order int default 0,
  is_featured boolean default false,
  tool_count int default 0,
  meta_title text,
  meta_description text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

insert into categories (name_en, name_bn, slug, description_bn, icon, color, is_featured, sort_order) values
  ('AI Writing Tools', 'AI লেখার টুলস', 'ai-writing', 'কনটেন্ট, ব্লগ, কপি লেখার সেরা AI টুলস', '✍️', '#4d9fff', true, 1),
  ('AI Video Tools', 'AI ভিডিও টুলস', 'ai-video', 'ভিডিও তৈরি ও এডিটিংয়ের AI টুলস', '🎬', '#ff4d00', true, 2),
  ('AI Image Generators', 'AI ছবি তৈরির টুলস', 'ai-image', 'AI দিয়ে অসাধারণ ছবি তৈরি করুন', '🎨', '#9b59b6', true, 3),
  ('AI Coding Tools', 'AI কোডিং টুলস', 'ai-coding', 'কোড লেখা ও ডিবাগিংয়ের AI টুলস', '💻', '#00ff88', true, 4),
  ('AI Marketing Tools', 'AI মার্কেটিং টুলস', 'ai-marketing', 'মার্কেটিং ও বিজ্ঞাপনের AI টুলস', '📣', '#f39c12', true, 5),
  ('AI Productivity Tools', 'AI প্রোডাক্টিভিটি টুলস', 'ai-productivity', 'কাজ দ্রুত করার AI টুলস', '⚡', '#1abc9c', true, 6),
  ('AI Website Builders', 'AI ওয়েবসাইট বিল্ডার', 'ai-website', 'AI দিয়ে ওয়েবসাইট বানান', '🌐', '#3498db', false, 7),
  ('AI Voice Tools', 'AI ভয়েস টুলস', 'ai-voice', 'ভয়েস জেনারেশন ও ক্লোনিং টুলস', '🎙️', '#e74c3c', false, 8),
  ('AI Automation Tools', 'AI অটোমেশন টুলস', 'ai-automation', 'কাজ অটোমেট করার AI টুলস', '🤖', '#8e44ad', false, 9),
  ('AI Research Tools', 'AI রিসার্চ টুলস', 'ai-research', 'গবেষণা ও তথ্য সংগ্রহের AI টুলস', '🔬', '#27ae60', false, 10),
  ('AI Chatbots', 'AI চ্যাটবট', 'ai-chatbot', 'সেরা AI চ্যাটবট টুলস', '💬', '#2980b9', false, 11),
  ('AI Design Tools', 'AI ডিজাইন টুলস', 'ai-design', 'গ্রাফিক ডিজাইনের AI টুলস', '🎭', '#c0392b', false, 12),
  ('AI SEO Tools', 'AI SEO টুলস', 'ai-seo', 'SEO ও কনটেন্ট অপ্টিমাইজেশন টুলস', '📈', '#16a085', false, 13),
  ('AI Presentation Tools', 'AI প্রেজেন্টেশন টুলস', 'ai-presentation', 'স্লাইড ও প্রেজেন্টেশন তৈরির টুলস', '📊', '#d35400', false, 14),
  ('AI Business Tools', 'AI বিজনেস টুলস', 'ai-business', 'ব্যবসায়িক কাজের AI টুলস', '💼', '#7f8c8d', false, 15);

-- ============================================
-- AI TOOLS
-- ============================================
create table tools (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text unique not null,
  tagline_bn text,
  description_bn text,
  website_url text,
  category_id uuid references categories(id),
  secondary_category_ids uuid[] default '{}',
  pricing_type pricing_type default 'freemium',
  starting_price_usd decimal(10,2),
  has_free_plan boolean default false,
  free_plan_details_bn text,
  platforms text[] default '{}',
  logo_url text,
  screenshot_urls text[] default '{}',
  -- ratings
  overall_rating decimal(3,1) default 0,
  ease_of_use_rating decimal(3,1) default 0,
  value_rating decimal(3,1) default 0,
  feature_rating decimal(3,1) default 0,
  -- badges
  is_editors_choice boolean default false,
  is_best_for_beginners boolean default false,
  is_best_value boolean default false,
  is_free_forever boolean default false,
  is_trending boolean default false,
  is_new boolean default false,
  badge_text text,
  -- content (jsonb arrays)
  key_features jsonb default '[]',
  pros jsonb default '[]',
  cons jsonb default '[]',
  best_for jsonb default '[]',
  use_cases jsonb default '[]',
  faq jsonb default '[]',
  who_should_use_bn text,
  expert_verdict_bn text,
  -- meta
  meta_title text,
  meta_description text,
  -- stats
  view_count int default 0,
  click_count int default 0,
  affiliate_click_count int default 0,
  -- status
  status content_status default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TOOL ALTERNATIVES
-- ============================================
create table tool_alternatives (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid references tools(id) on delete cascade,
  alternative_tool_id uuid references tools(id) on delete cascade,
  sort_order int default 0,
  unique(tool_id, alternative_tool_id)
);

-- ============================================
-- AFFILIATE LINKS
-- ============================================
create table affiliate_links (
  id uuid primary key default uuid_generate_v4(),
  tool_id uuid references tools(id) on delete cascade,
  tool_name text not null,
  slug text unique not null, -- used for /go/[slug]
  destination_url text not null,
  commission_info text,
  is_active boolean default true,
  click_count int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table affiliate_clicks (
  id uuid primary key default uuid_generate_v4(),
  affiliate_link_id uuid references affiliate_links(id),
  referrer_url text,
  user_agent text,
  ip_hash text,
  clicked_at timestamptz default now()
);

-- ============================================
-- BLOG POSTS (all content types)
-- ============================================
create table blog_posts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  content_type content_type default 'blog',
  excerpt_bn text,
  content_bn text,
  thumbnail_url text,
  thumbnail_alt text,
  og_image_url text,
  reading_time_minutes int default 5,
  word_count int default 0,
  -- seo
  meta_title text,
  meta_description text,
  focus_keyword text,
  -- categorization
  category_id uuid references categories(id),
  tags text[] default '{}',
  related_tool_ids uuid[] default '{}',
  -- affiliate
  has_affiliate_links boolean default false,
  affiliate_disclosure boolean default true,
  -- source (for auto content)
  source_platform source_platform,
  source_url text,
  source_title text,
  -- internal linking
  internal_links jsonb default '[]',
  -- status
  status content_status default 'draft',
  published_at timestamptz,
  scheduled_at timestamptz,
  -- stats
  view_count int default 0,
  share_count int default 0,
  -- meta
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- COMPARISONS
-- ============================================
create table comparisons (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  tool_ids uuid[] not null,
  content_bn text,
  winner_tool_id uuid references tools(id),
  winner_reason_bn text,
  comparison_table jsonb default '[]',
  meta_title text,
  meta_description text,
  status content_status default 'draft',
  view_count int default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- TOP LISTS
-- ============================================
create table top_lists (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description_bn text,
  content_bn text,
  tool_ids uuid[] default '[]',
  thumbnail_url text,
  meta_title text,
  meta_description text,
  tags text[] default '{}',
  status content_status default 'draft',
  view_count int default 0,
  published_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- DEALS
-- ============================================
create table deals (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  tool_id uuid references tools(id),
  tool_name text,
  description_bn text,
  deal_type text default 'discount', -- discount, lifetime, free_trial, coupon
  coupon_code text,
  discount_percent int,
  affiliate_url text,
  original_price_usd decimal(10,2),
  deal_price_usd decimal(10,2),
  expires_at timestamptz,
  is_verified boolean default false,
  is_featured boolean default false,
  click_count int default 0,
  status content_status default 'published',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- PROMPTS LIBRARY
-- ============================================
create table prompts (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  prompt_text text not null,
  description_bn text,
  category text not null, -- chatgpt, midjourney, business, freelancing, content
  tool_name text,
  tags text[] default '{}',
  is_featured boolean default false,
  use_count int default 0,
  status content_status default 'published',
  created_at timestamptz default now()
);

-- ============================================
-- WORKFLOWS LIBRARY
-- ============================================
create table workflows (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text unique not null,
  description_bn text,
  steps jsonb default '[]',
  tools_used uuid[] default '[]',
  category text not null,
  difficulty text default 'beginner',
  estimated_time_minutes int,
  is_featured boolean default false,
  download_count int default 0,
  status content_status default 'published',
  created_at timestamptz default now()
);

-- ============================================
-- SCRAPE QUEUE
-- ============================================
create table scrape_queue (
  id uuid primary key default uuid_generate_v4(),
  source_platform source_platform not null,
  source_url text not null,
  source_title text,
  source_content text,
  source_score int default 0,
  source_engagement jsonb default '{}',
  relevance_score int default 0,
  is_duplicate boolean default false,
  duplicate_of_slug text,
  status text default 'pending', -- pending, approved, rejected, published, failed
  rejection_reason text,
  assigned_content_type content_type,
  generated_blog_id uuid references blog_posts(id),
  scraped_at timestamptz default now(),
  reviewed_at timestamptz,
  published_at timestamptz
);

-- ============================================
-- PUBLISHED TOPICS (duplicate prevention)
-- ============================================
create table published_topics (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null,
  keywords text[] default '{}',
  blog_post_id uuid references blog_posts(id),
  published_at timestamptz default now()
);

-- ============================================
-- SOCIAL POSTS
-- ============================================
create table social_posts (
  id uuid primary key default uuid_generate_v4(),
  blog_post_id uuid references blog_posts(id),
  platform text default 'facebook',
  hook_text text not null,
  image_url text,
  hashtags text[] default '{}',
  full_post_text text,
  facebook_post_id text,
  facebook_comment_id text,
  blog_link text,
  status social_status default 'pending',
  scheduled_at timestamptz,
  posted_at timestamptz,
  comment_posted_at timestamptz,
  retry_count int default 0,
  error_message text,
  reach int,
  likes int,
  comments int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================
-- OPENCLAW JOBS
-- ============================================
create table openclaw_jobs (
  id uuid primary key default uuid_generate_v4(),
  job_name text not null,
  trigger_type text default 'scheduled', -- scheduled, manual
  status job_status default 'pending',
  total_scraped int default 0,
  total_published int default 0,
  total_failed int default 0,
  posts_target int default 3,
  started_at timestamptz,
  completed_at timestamptz,
  error_message text,
  created_at timestamptz default now()
);

create table openclaw_job_logs (
  id uuid primary key default uuid_generate_v4(),
  job_id uuid references openclaw_jobs(id) on delete cascade,
  step text not null,
  status text not null, -- success, error, info, warning
  message text,
  data jsonb,
  logged_at timestamptz default now()
);

-- ============================================
-- NEWSLETTER
-- ============================================
create table newsletter_subscribers (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  name text,
  is_active boolean default true,
  source text default 'website',
  subscribed_at timestamptz default now(),
  unsubscribed_at timestamptz
);

create table newsletter_campaigns (
  id uuid primary key default uuid_generate_v4(),
  subject text not null,
  content_html text,
  content_text text,
  sent_count int default 0,
  open_count int default 0,
  click_count int default 0,
  status text default 'draft',
  sent_at timestamptz,
  created_at timestamptz default now()
);

-- ============================================
-- ANALYTICS
-- ============================================
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null, -- page_view, tool_click, affiliate_click, search, share
  page_path text,
  tool_id uuid,
  post_id uuid,
  search_query text,
  referrer text,
  user_agent text,
  ip_hash text,
  created_at timestamptz default now()
);

create table search_analytics (
  id uuid primary key default uuid_generate_v4(),
  query text not null,
  results_count int default 0,
  clicked_result_id uuid,
  searched_at timestamptz default now()
);

-- ============================================
-- GLOSSARY
-- ============================================
create table glossary_terms (
  id uuid primary key default uuid_generate_v4(),
  term_en text not null,
  term_bn text,
  definition_bn text not null,
  example_bn text,
  related_terms text[] default '{}',
  category text,
  slug text unique not null,
  created_at timestamptz default now()
);

insert into glossary_terms (term_en, term_bn, definition_bn, slug) values
  ('Prompt', 'প্রম্পট', 'AI কে কী করতে হবে সেটা বলার জন্য যে নির্দেশনা দেওয়া হয়', 'prompt'),
  ('Fine-tuning', 'ফাইন-টিউনিং', 'একটি AI মডেলকে নির্দিষ্ট কাজের জন্য বিশেষভাবে প্রশিক্ষণ দেওয়া', 'fine-tuning'),
  ('LLM', 'এলএলএম', 'Large Language Model — বড় পরিসরে প্রশিক্ষিত AI ভাষা মডেল', 'llm'),
  ('API', 'এপিআই', 'Application Programming Interface — সফটওয়্যার যোগাযোগের মাধ্যম', 'api'),
  ('No-code', 'নো-কোড', 'কোড না লিখেই অ্যাপ বা অটোমেশন তৈরির পদ্ধতি', 'no-code'),
  ('Automation', 'অটোমেশন', 'কাজ স্বয়ংক্রিয়ভাবে সম্পন্ন করার প্রক্রিয়া', 'automation'),
  ('Generative AI', 'জেনারেটিভ AI', 'নতুন কনটেন্ট (টেক্সট, ছবি, ভিডিও) তৈরি করতে পারে এমন AI', 'generative-ai'),
  ('Token', 'টোকেন', 'AI মডেল যেভাবে টেক্সট পড়ে ও প্রক্রিয়া করে তার একক', 'token');

-- ============================================
-- INDEXES
-- ============================================
create index idx_tools_slug on tools(slug);
create index idx_tools_category on tools(category_id);
create index idx_tools_status on tools(status);
create index idx_tools_trending on tools(is_trending) where is_trending = true;
create index idx_tools_new on tools(is_new) where is_new = true;
create index idx_blog_posts_slug on blog_posts(slug);
create index idx_blog_posts_status on blog_posts(status);
create index idx_blog_posts_type on blog_posts(content_type);
create index idx_blog_posts_published on blog_posts(published_at desc);
create index idx_scrape_queue_status on scrape_queue(status);
create index idx_social_posts_status on social_posts(status);
create index idx_openclaw_jobs_status on openclaw_jobs(status);
create index idx_analytics_type on analytics_events(event_type);
create index idx_analytics_created on analytics_events(created_at desc);
create index idx_tools_name_trgm on tools using gin(name gin_trgm_ops);
create index idx_blog_posts_title_trgm on blog_posts using gin(title gin_trgm_ops);

-- ============================================
-- ROW LEVEL SECURITY (public read)
-- ============================================
alter table categories enable row level security;
alter table tools enable row level security;
alter table blog_posts enable row level security;
alter table comparisons enable row level security;
alter table top_lists enable row level security;
alter table deals enable row level security;
alter table prompts enable row level security;
alter table workflows enable row level security;
alter table glossary_terms enable row level security;

create policy "Public read categories" on categories for select using (true);
create policy "Public read tools" on tools for select using (status = 'published');
create policy "Public read posts" on blog_posts for select using (status = 'published');
create policy "Public read comparisons" on comparisons for select using (status = 'published');
create policy "Public read top_lists" on top_lists for select using (status = 'published');
create policy "Public read deals" on deals for select using (status = 'published');
create policy "Public read prompts" on prompts for select using (status = 'published');
create policy "Public read workflows" on workflows for select using (status = 'published');
create policy "Public read glossary" on glossary_terms for select using (true);

-- ============================================
-- FUNCTIONS
-- ============================================

-- Update tool count in category
create or replace function update_category_tool_count()
returns trigger as $$
begin
  update categories set tool_count = (
    select count(*) from tools 
    where category_id = coalesce(new.category_id, old.category_id)
    and status = 'published'
  ) where id = coalesce(new.category_id, old.category_id);
  return new;
end;
$$ language plpgsql;

create trigger trg_update_category_count
after insert or update or delete on tools
for each row execute function update_category_tool_count();

-- Auto update updated_at
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_tools_updated_at before update on tools for each row execute function update_updated_at();
create trigger trg_posts_updated_at before update on blog_posts for each row execute function update_updated_at();
create trigger trg_categories_updated_at before update on categories for each row execute function update_updated_at();
create trigger trg_social_posts_updated_at before update on social_posts for each row execute function update_updated_at();
create trigger trg_affiliate_links_updated_at before update on affiliate_links for each row execute function update_updated_at();
