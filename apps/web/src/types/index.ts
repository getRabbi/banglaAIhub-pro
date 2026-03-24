// ============================================
// BanglaAIHub - Shared TypeScript Types
// ============================================

export type PricingType = 'free' | 'freemium' | 'paid' | 'open_source'
export type ContentStatus = 'draft' | 'published' | 'archived' | 'failed'
export type SocialStatus = 'pending' | 'posted' | 'failed' | 'skipped' | 'scheduled'
export type ContentType = 'tool_review' | 'comparison' | 'top_list' | 'guide' | 'blog' | 'deal' | 'money_making' | 'resource'
export type SourcePlatform = 'reddit' | 'x' | 'producthunt' | 'hackernews' | 'manual'
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled'

export interface Category {
  id: string
  name_en: string
  name_bn: string
  slug: string
  description_bn?: string
  icon: string
  color: string
  parent_id?: string
  sort_order: number
  is_featured: boolean
  tool_count: number
  meta_title?: string
  meta_description?: string
  created_at: string
  updated_at: string
}

export interface Tool {
  id: string
  name: string
  slug: string
  tagline_bn?: string
  description_bn?: string
  website_url?: string
  category_id?: string
  category?: Category
  secondary_category_ids: string[]
  pricing_type: PricingType
  starting_price_usd?: number
  has_free_plan: boolean
  free_plan_details_bn?: string
  platforms: string[]
  logo_url?: string
  screenshot_urls: string[]
  overall_rating: number
  ease_of_use_rating: number
  value_rating: number
  feature_rating: number
  is_editors_choice: boolean
  is_best_for_beginners: boolean
  is_best_value: boolean
  is_free_forever: boolean
  is_trending: boolean
  is_new: boolean
  badge_text?: string
  key_features: string[]
  pros: string[]
  cons: string[]
  best_for: string[]
  use_cases: string[]
  faq: FAQItem[]
  who_should_use_bn?: string
  expert_verdict_bn?: string
  meta_title?: string
  meta_description?: string
  view_count: number
  click_count: number
  affiliate_click_count: number
  status: ContentStatus
  affiliate_link?: AffiliateLink
  alternatives?: Tool[]
  created_at: string
  updated_at: string
}

export interface FAQItem {
  question: string
  answer: string
}

export interface AffiliateLink {
  id: string
  tool_id: string
  tool_name: string
  slug: string
  destination_url: string
  commission_info?: string
  is_active: boolean
  click_count: number
  created_at: string
  updated_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content_type: ContentType
  excerpt_bn?: string
  content_bn?: string
  thumbnail_url?: string
  thumbnail_alt?: string
  og_image_url?: string
  reading_time_minutes: number
  word_count: number
  meta_title?: string
  meta_description?: string
  focus_keyword?: string
  category_id?: string
  category?: Category
  tags: string[]
  related_tool_ids: string[]
  related_tools?: Tool[]
  has_affiliate_links: boolean
  affiliate_disclosure: boolean
  source_platform?: SourcePlatform
  source_url?: string
  source_title?: string
  internal_links: InternalLink[]
  status: ContentStatus
  published_at?: string
  scheduled_at?: string
  view_count: number
  share_count: number
  created_at: string
  updated_at: string
  social_post?: SocialPost
}

export interface InternalLink {
  keyword: string
  url: string
  title: string
}

export interface SocialPost {
  id: string
  blog_post_id: string
  platform: string
  hook_text: string
  image_url?: string
  hashtags: string[]
  full_post_text: string
  facebook_post_id?: string
  facebook_comment_id?: string
  blog_link?: string
  status: SocialStatus
  scheduled_at?: string
  posted_at?: string
  comment_posted_at?: string
  retry_count: number
  error_message?: string
  reach?: number
  likes?: number
  comments?: number
  created_at: string
  updated_at: string
}

export interface ScrapeQueueItem {
  id: string
  source_platform: SourcePlatform
  source_url: string
  source_title?: string
  source_content?: string
  source_score: number
  source_engagement: Record<string, number>
  relevance_score: number
  is_duplicate: boolean
  duplicate_of_slug?: string
  status: 'pending' | 'approved' | 'rejected' | 'published' | 'failed'
  rejection_reason?: string
  assigned_content_type?: ContentType
  generated_blog_id?: string
  scraped_at: string
  reviewed_at?: string
  published_at?: string
}

export interface OpenClawJob {
  id: string
  job_name: string
  trigger_type: 'scheduled' | 'manual'
  status: JobStatus
  total_scraped: number
  total_published: number
  total_failed: number
  posts_target: number
  started_at?: string
  completed_at?: string
  error_message?: string
  created_at: string
  logs?: OpenClawJobLog[]
}

export interface OpenClawJobLog {
  id: string
  job_id: string
  step: string
  status: 'success' | 'error' | 'info' | 'warning'
  message: string
  data?: Record<string, unknown>
  logged_at: string
}

export interface Deal {
  id: string
  title: string
  slug: string
  tool_id?: string
  tool?: Tool
  tool_name?: string
  description_bn?: string
  deal_type: 'discount' | 'lifetime' | 'free_trial' | 'coupon'
  coupon_code?: string
  discount_percent?: number
  affiliate_url?: string
  original_price_usd?: number
  deal_price_usd?: number
  expires_at?: string
  is_verified: boolean
  is_featured: boolean
  click_count: number
  status: ContentStatus
  created_at: string
  updated_at: string
}

export interface Prompt {
  id: string
  title: string
  slug: string
  prompt_text: string
  description_bn?: string
  category: string
  tool_name?: string
  tags: string[]
  is_featured: boolean
  use_count: number
  status: ContentStatus
  created_at: string
}

export interface Comparison {
  id: string
  title: string
  slug: string
  tool_ids: string[]
  tools?: Tool[]
  content_bn?: string
  winner_tool_id?: string
  winner_reason_bn?: string
  comparison_table: ComparisonRow[]
  meta_title?: string
  meta_description?: string
  status: ContentStatus
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface ComparisonRow {
  feature: string
  values: Record<string, string>
}

export interface TopList {
  id: string
  title: string
  slug: string
  description_bn?: string
  content_bn?: string
  tool_ids: string[]
  tools?: Tool[]
  thumbnail_url?: string
  meta_title?: string
  meta_description?: string
  tags: string[]
  status: ContentStatus
  view_count: number
  published_at?: string
  created_at: string
  updated_at: string
}

export interface GlossaryTerm {
  id: string
  term_en: string
  term_bn?: string
  definition_bn: string
  example_bn?: string
  related_terms: string[]
  category?: string
  slug: string
  created_at: string
}

export interface SiteSettings {
  openclaw_enabled: boolean
  daily_post_count: number
  post_schedule_times: string[]
  source_weights: Record<string, number>
  min_word_count: number
  keyword_blacklist: string[]
  facebook_page_id: string
  facebook_access_token: string
  facebook_comment_delay_minutes: number
  unsplash_access_key: string
  gemini_api_key: string
  reddit_client_id: string
  reddit_client_secret: string
  affiliate_disclosure_text: string
  default_facebook_hashtags: string[]
  email_alert_address: string
  site_url: string
  admin_url: string
}

export interface NewsletterSubscriber {
  id: string
  email: string
  name?: string
  is_active: boolean
  source: string
  subscribed_at: string
  unsubscribed_at?: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  per_page: number
  total_pages: number
}

export interface ApiResponse<T> {
  data?: T
  error?: string
  message?: string
}

// Quick Submit form
export interface QuickSubmitForm {
  source_title: string
  source_url?: string
  source_platform: SourcePlatform
  main_idea: string
  category_id?: string
  tool_name?: string
  affiliate_link_id?: string
  content_type: ContentType
  rewrite_style: 'use_input' | 'rewrite_professionally' | 'expand_full_blog' | 'affiliate_focused' | 'stronger_hook'
  publish_now: boolean
  scheduled_at?: string
  generate_facebook_post: boolean
  thumbnail_url?: string
}

// Analytics
export interface AnalyticsSummary {
  total_views: number
  total_affiliate_clicks: number
  total_tool_clicks: number
  total_searches: number
  top_posts: { title: string; slug: string; views: number }[]
  top_tools: { name: string; slug: string; clicks: number }[]
  top_searches: { query: string; count: number }[]
  posts_this_week: number
  facebook_posts_this_week: number
}
