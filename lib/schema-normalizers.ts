const BLOG_CATEGORY_KEYS = ["money-making", "ai-tools", "tech-news", "product-review"] as const;

type BlogCategory = (typeof BLOG_CATEGORY_KEYS)[number];

function mojibakeScore(value: string): number {
  return (value.match(/[àâðÃ][\u0080-\u00ff]/g) || []).length;
}

function repairText(value: unknown): string {
  const text = typeof value === "string" ? value : "";
  if (!text || !/[àâðÃ][\u0080-\u00ff]/.test(text)) return text;

  try {
    const bytes = Array.from(text, (char) => {
      const code = char.charCodeAt(0);
      return code <= 255 ? `%${code.toString(16).padStart(2, "0")}` : encodeURIComponent(char);
    }).join("");
    const decoded = decodeURIComponent(bytes);
    return mojibakeScore(decoded) < mojibakeScore(text) ? decoded : text;
  } catch {
    return text;
  }
}

function repairTextArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item) => typeof item === "string").map(repairText) : [];
}

function firstLegacyCategory(tags: unknown): BlogCategory | null {
  if (!Array.isArray(tags)) return null;
  return (tags.find((tag) => BLOG_CATEGORY_KEYS.includes(tag as BlogCategory)) as BlogCategory | undefined) || null;
}

function estimateNormalizedReadTime(text: string): number {
  const words = (text || "").trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 180));
}

function deriveBlogCategory(row: any): BlogCategory {
  const tagged = firstLegacyCategory(row?.tags);

  const slug = row?.category || row?.categories?.slug || "";
  if (slug === "ai-business") return "money-making";
  if (slug === "ai-productivity") return "product-review";
  if (typeof slug === "string" && slug.startsWith("ai-")) return "ai-tools";

  const haystack = [
    row?.title,
    row?.title_bn,
    row?.bangla_title,
    row?.source_title,
    row?.excerpt_bn,
    row?.hook_bn,
    row?.bangla_hook,
    row?.meta_description,
    row?.source_platform,
    ...(Array.isArray(row?.tags) ? row.tags : []),
  ]
    .map(repairText)
    .join(" ")
    .toLowerCase();

  if (/(income|freelanc|earn|monetiz|side hustle|আয়|আয়|ফ্রিল্যান্স|ইনকাম)/i.test(haystack)) return "money-making";
  if (/(review|vs|alternative|pricing|product|রিভিউ|তুলনা|দাম)/i.test(haystack)) return "product-review";
  if (/(chatgpt|llm|agent|automation|workflow|prompt|prompts|open[- ]source|self[- ]hosted|github|huggingface|transformers|ollama|dify|autogpt|langchain|n8n|zapier|free ai|ai tools|ওপেন-সোর্স|এআই টুল|টুল)/i.test(haystack)) {
    return "ai-tools";
  }

  if (tagged) return tagged;
  if (BLOG_CATEGORY_KEYS.includes(slug as BlogCategory)) return slug as BlogCategory;
  return "tech-news";
}

export function normalizeBlogPost(row: any) {
  const slug = row?.blog_slug || row?.slug || "";
  const title = repairText(row?.bangla_title || row?.title_bn || row?.title || row?.source_title || "Untitled");
  const body = repairText(row?.bangla_body || row?.body_bn || row?.content_bn || row?.body || row?.content || "");
  const excerpt = repairText(row?.bangla_hook || row?.hook_bn || row?.excerpt_bn || row?.summary_bn || row?.meta_description || "");
  const publishedAt = row?.published_at || row?.created_at || new Date(0).toISOString();
  const tags = repairTextArray(row?.tags);

  return {
    ...row,
    bangla_title: title,
    bangla_body: body,
    bangla_hook: excerpt,
    blog_slug: slug,
    blog_url: row?.blog_url || `/blog/${slug}`,
    meta_description: repairText(row?.meta_description || excerpt),
    category: deriveBlogCategory(row),
    status: row?.status || (row?.is_published ? "published" : "draft"),
    tags,
    source: row?.source || row?.source_platform || "manual",
    read_time_min: row?.read_time_min || row?.reading_time_minutes || row?.read_time || estimateNormalizedReadTime(body || excerpt || title),
    view_count: row?.view_count || 0,
    published_at: publishedAt,
    updated_at: row?.updated_at || publishedAt,
    thumbnail_url: row?.thumbnail_url || undefined,
    thumbnail_alt: row?.thumbnail_alt || title,
    og_image_url: row?.og_image_url || row?.thumbnail_url || undefined,
  };
}

export function normalizeBlogPosts(rows: any[] | null | undefined) {
  return (rows || []).map(normalizeBlogPost);
}

export function deriveToolBadge(tool: any): string | null {
  if (tool?.badge) return tool.badge;
  if (tool?.is_editors_choice) return "editors_choice";
  if (tool?.is_best_value) return "best_value";
  if (tool?.is_trending) return "trending";
  if (tool?.is_new) return "new";
  return null;
}

export function normalizeTool(row: any) {
  return {
    ...row,
    pricing: row?.pricing || row?.pricing_type || "freemium",
    badge: deriveToolBadge(row),
    rating: row?.rating || row?.overall_rating || 0,
    features_bn: row?.features_bn || row?.key_features || [],
    pricing_detail: row?.pricing_detail || row?.free_plan_details_bn || "",
  };
}

export function normalizeTools(rows: any[] | null | undefined) {
  return (rows || []).map(normalizeTool);
}
