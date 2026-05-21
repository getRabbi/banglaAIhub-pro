-- BanglaAIHub — Complete Database Schema (21 tables)

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, name_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description TEXT DEFAULT '', description_bn TEXT DEFAULT '', icon TEXT DEFAULT '', color TEXT DEFAULT '#3b82f6',
    tool_count INTEGER DEFAULT 0, sort_order INTEGER DEFAULT 0, is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tools (
    id BIGSERIAL PRIMARY KEY, name TEXT NOT NULL, slug TEXT UNIQUE NOT NULL, tagline TEXT DEFAULT '',
    tagline_bn TEXT DEFAULT '', description TEXT DEFAULT '', description_bn TEXT DEFAULT '',
    logo_url TEXT DEFAULT '', website_url TEXT DEFAULT '', affiliate_url TEXT DEFAULT '',
    category_id BIGINT REFERENCES categories(id), pricing TEXT DEFAULT 'free' CHECK (pricing IN ('free','freemium','paid','enterprise')),
    pricing_details TEXT DEFAULT '', rating DECIMAL(2,1) DEFAULT 0, review_count INTEGER DEFAULT 0,
    badge TEXT DEFAULT '' CHECK (badge IN ('','editors_choice','trending','new','popular','best_value')),
    features TEXT[] DEFAULT '{}', features_bn TEXT[] DEFAULT '{}', pros TEXT[] DEFAULT '{}', pros_bn TEXT[] DEFAULT '{}',
    cons TEXT[] DEFAULT '{}', cons_bn TEXT[] DEFAULT '{}', faq JSONB DEFAULT '[]',
    is_featured BOOLEAN DEFAULT FALSE, is_published BOOLEAN DEFAULT TRUE, view_count INTEGER DEFAULT 0,
    click_count INTEGER DEFAULT 0, meta_title TEXT DEFAULT '', meta_description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS tool_alternatives (
    id BIGSERIAL PRIMARY KEY, tool_id BIGINT REFERENCES tools(id) ON DELETE CASCADE,
    alternative_id BIGINT REFERENCES tools(id) ON DELETE CASCADE, reason TEXT DEFAULT '', reason_bn TEXT DEFAULT '',
    UNIQUE(tool_id, alternative_id)
);

CREATE TABLE IF NOT EXISTS comparisons (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    tool_a_id BIGINT REFERENCES tools(id), tool_b_id BIGINT REFERENCES tools(id),
    body TEXT DEFAULT '', body_bn TEXT DEFAULT '', verdict TEXT DEFAULT '', verdict_bn TEXT DEFAULT '',
    is_published BOOLEAN DEFAULT TRUE, view_count INTEGER DEFAULT 0, meta_title TEXT DEFAULT '',
    meta_description TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS top_lists (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description_bn TEXT DEFAULT '', body_bn TEXT DEFAULT '', tool_ids BIGINT[] DEFAULT '{}',
    category_id BIGINT REFERENCES categories(id), is_published BOOLEAN DEFAULT TRUE,
    view_count INTEGER DEFAULT 0, meta_title TEXT DEFAULT '', meta_description TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS guides (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    body_bn TEXT DEFAULT '', category_id BIGINT REFERENCES categories(id),
    difficulty TEXT DEFAULT 'beginner' CHECK (difficulty IN ('beginner','intermediate','advanced')),
    is_published BOOLEAN DEFAULT TRUE, view_count INTEGER DEFAULT 0, read_time_min INTEGER DEFAULT 5,
    meta_title TEXT DEFAULT '', meta_description TEXT DEFAULT '', thumbnail_url TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS blog_posts (
    id BIGSERIAL PRIMARY KEY, source TEXT DEFAULT 'manual' CHECK (source IN ('manual','reddit','x','hackernews','producthunt')),
    source_url TEXT DEFAULT '', original_title TEXT DEFAULT '', original_body TEXT DEFAULT '',
    title_bn TEXT NOT NULL, body_bn TEXT NOT NULL, hook_bn TEXT DEFAULT '', slug TEXT UNIQUE NOT NULL,
    category TEXT DEFAULT 'tech-news' CHECK (category IN ('money-making','ai-tools','tech-news','product-review')),
    tags TEXT[] DEFAULT '{}', meta_title TEXT DEFAULT '', meta_description TEXT DEFAULT '',
    thumbnail_url TEXT DEFAULT '', read_time_min INTEGER DEFAULT 3, view_count INTEGER DEFAULT 0,
    engagement_score INTEGER DEFAULT 0, content_hash TEXT UNIQUE, quality_score INTEGER DEFAULT 0,
    quality_grade TEXT DEFAULT '', is_published BOOLEAN DEFAULT FALSE, fb_posted BOOLEAN DEFAULT FALSE,
    fb_post_id TEXT, fb_comment_id TEXT, published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS deals (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description_bn TEXT DEFAULT '', tool_id BIGINT REFERENCES tools(id), coupon_code TEXT DEFAULT '',
    discount_text TEXT DEFAULT '', discount_text_bn TEXT DEFAULT '', deal_url TEXT DEFAULT '',
    expires_at TIMESTAMPTZ, is_active BOOLEAN DEFAULT TRUE, is_featured BOOLEAN DEFAULT FALSE,
    view_count INTEGER DEFAULT 0, click_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS prompts (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description_bn TEXT DEFAULT '', prompt_text TEXT NOT NULL, category TEXT DEFAULT 'general',
    tool_name TEXT DEFAULT '', use_case TEXT DEFAULT '', use_case_bn TEXT DEFAULT '',
    is_published BOOLEAN DEFAULT TRUE, view_count INTEGER DEFAULT 0, download_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workflows (
    id BIGSERIAL PRIMARY KEY, title TEXT NOT NULL, title_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    description_bn TEXT DEFAULT '', steps JSONB DEFAULT '[]', tool_ids BIGINT[] DEFAULT '{}',
    category TEXT DEFAULT 'general', is_published BOOLEAN DEFAULT TRUE, view_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_links (
    id BIGSERIAL PRIMARY KEY, tool_id BIGINT REFERENCES tools(id), slug TEXT UNIQUE NOT NULL,
    destination_url TEXT NOT NULL, label TEXT DEFAULT '', click_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS affiliate_clicks (
    id BIGSERIAL PRIMARY KEY, link_id BIGINT REFERENCES affiliate_links(id), tool_id BIGINT,
    referrer TEXT DEFAULT '', ip_hash TEXT DEFAULT '', user_agent TEXT DEFAULT '',
    clicked_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS scrape_queue (
    id BIGSERIAL PRIMARY KEY, source TEXT NOT NULL, source_url TEXT DEFAULT '', title TEXT NOT NULL,
    body TEXT DEFAULT '', engagement_score INTEGER DEFAULT 0,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','published')),
    rejection_reason TEXT DEFAULT '', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS published_topics (
    id BIGSERIAL PRIMARY KEY, title_hash TEXT UNIQUE NOT NULL, slug TEXT NOT NULL,
    source TEXT DEFAULT '', published_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS social_posts (
    id BIGSERIAL PRIMARY KEY, blog_post_id BIGINT REFERENCES blog_posts(id),
    platform TEXT DEFAULT 'facebook' CHECK (platform IN ('facebook','telegram','pinterest')),
    post_text TEXT NOT NULL, post_url TEXT DEFAULT '', image_url TEXT DEFAULT '',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending','scheduled','posted','failed')),
    scheduled_at TIMESTAMPTZ, posted_at TIMESTAMPTZ, platform_post_id TEXT,
    error_message TEXT DEFAULT '', retry_count INTEGER DEFAULT 0, created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS newsletter_subscribers (
    id BIGSERIAL PRIMARY KEY, email TEXT UNIQUE NOT NULL, name TEXT DEFAULT '',
    is_confirmed BOOLEAN DEFAULT FALSE, is_active BOOLEAN DEFAULT TRUE,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(), confirmed_at TIMESTAMPTZ, unsubscribed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS analytics_events (
    id BIGSERIAL PRIMARY KEY,
    event_type TEXT NOT NULL CHECK (event_type IN ('page_view','tool_click','affiliate_click','search','share','download')),
    entity_type TEXT DEFAULT '', entity_id BIGINT, entity_slug TEXT DEFAULT '',
    referrer TEXT DEFAULT '', ip_hash TEXT DEFAULT '', metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS openclaw_jobs (
    id BIGSERIAL PRIMARY KEY, job_type TEXT DEFAULT 'daily_pipeline',
    status TEXT DEFAULT 'running' CHECK (status IN ('running','completed','failed')),
    started_at TIMESTAMPTZ DEFAULT NOW(), completed_at TIMESTAMPTZ,
    stats JSONB DEFAULT '{}', error_message TEXT DEFAULT ''
);

CREATE TABLE IF NOT EXISTS openclaw_job_logs (
    id BIGSERIAL PRIMARY KEY, job_id BIGINT REFERENCES openclaw_jobs(id),
    level TEXT DEFAULT 'info' CHECK (level IN ('info','warn','error')),
    message TEXT NOT NULL, metadata JSONB DEFAULT '{}', created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS site_settings (
    key TEXT PRIMARY KEY, value TEXT NOT NULL, updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS glossary_terms (
    id BIGSERIAL PRIMARY KEY, term TEXT NOT NULL, term_bn TEXT NOT NULL, slug TEXT UNIQUE NOT NULL,
    definition_bn TEXT NOT NULL, related_tool_ids BIGINT[] DEFAULT '{}',
    is_published BOOLEAN DEFAULT TRUE, created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_tools_cat ON tools(category_id);
CREATE INDEX IF NOT EXISTS idx_tools_feat ON tools(is_featured) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_pub ON blog_posts(published_at DESC) WHERE is_published = TRUE;
CREATE INDEX IF NOT EXISTS idx_blog_cat ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_hash ON blog_posts(content_hash);
CREATE INDEX IF NOT EXISTS idx_deals_act ON deals(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_aff_slug ON affiliate_links(slug);
CREATE INDEX IF NOT EXISTS idx_scrape_st ON scrape_queue(status);
CREATE INDEX IF NOT EXISTS idx_topics_h ON published_topics(title_hash);
CREATE INDEX IF NOT EXISTS idx_analytics ON analytics_events(event_type, created_at DESC);

-- RLS
DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT unnest(ARRAY['categories','tools','blog_posts','comparisons','top_lists','guides','deals','prompts','workflows','glossary_terms','affiliate_links','newsletter_subscribers']) LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', t);
  END LOOP;
END $$;

CREATE POLICY "pub_categories" ON categories FOR SELECT USING (is_active = TRUE);
CREATE POLICY "pub_tools" ON tools FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_blog" ON blog_posts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_comparisons" ON comparisons FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_top_lists" ON top_lists FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_guides" ON guides FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_deals" ON deals FOR SELECT USING (is_active = TRUE);
CREATE POLICY "pub_prompts" ON prompts FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_workflows" ON workflows FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_glossary" ON glossary_terms FOR SELECT USING (is_published = TRUE);
CREATE POLICY "pub_aff" ON affiliate_links FOR SELECT USING (is_active = TRUE);

-- Service role full
DO $$ DECLARE t TEXT; BEGIN
  FOR t IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE format('CREATE POLICY "svc_%s" ON %I FOR ALL USING (auth.role()=''service_role'') WITH CHECK (auth.role()=''service_role'')', t, t);
  END LOOP;
END $$;

-- Functions
CREATE OR REPLACE FUNCTION increment_view(tbl TEXT, slug_val TEXT) RETURNS VOID AS $$
BEGIN EXECUTE format('UPDATE %I SET view_count=view_count+1 WHERE slug=$1', tbl) USING slug_val; END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_affiliate_dest(link_slug TEXT) RETURNS TEXT AS $$
DECLARE dest TEXT; BEGIN
  UPDATE affiliate_links SET click_count=click_count+1 WHERE slug=link_slug AND is_active=TRUE RETURNING destination_url INTO dest;
  RETURN dest;
END; $$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION auto_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at=NOW(); RETURN NEW; END; $$ LANGUAGE plpgsql;

SELECT 'BanglaAIHub — 21 tables ready!' AS status;
