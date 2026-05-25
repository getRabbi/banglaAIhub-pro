const BLOG_CATEGORY_KEYS = ["money-making", "ai-tools", "tech-news", "product-review"] as const;

type BlogCategory = (typeof BLOG_CATEGORY_KEYS)[number];

function firstLegacyCategory(tags: unknown): BlogCategory | null {
  if (!Array.isArray(tags)) return null;
  return (tags.find((tag) => BLOG_CATEGORY_KEYS.includes(tag as BlogCategory)) as BlogCategory | undefined) || null;
}

function deriveBlogCategory(row: any): BlogCategory {
  const tagged = firstLegacyCategory(row?.tags);
  if (tagged) return tagged;

  const slug = row?.category || row?.categories?.slug || "";
  if (slug === "ai-business") return "money-making";
  if (slug === "ai-productivity") return "product-review";
  if (typeof slug === "string" && slug.startsWith("ai-")) return "ai-tools";
  if (BLOG_CATEGORY_KEYS.includes(slug as BlogCategory)) return slug as BlogCategory;
  return "tech-news";
}

export function normalizeBlogPost(row: any) {
  const slug = row?.blog_slug || row?.slug || "";
  const title = row?.bangla_title || row?.title || row?.source_title || "Untitled";
  const excerpt = row?.bangla_hook || row?.excerpt_bn || row?.meta_description || "";
  const publishedAt = row?.published_at || row?.created_at || new Date(0).toISOString();

  return {
    ...row,
    bangla_title: title,
    bangla_body: row?.bangla_body || row?.content_bn || "",
    bangla_hook: excerpt,
    blog_slug: slug,
    blog_url: row?.blog_url || `/blog/${slug}`,
    meta_description: row?.meta_description || excerpt,
    category: deriveBlogCategory(row),
    tags: Array.isArray(row?.tags) ? row.tags : [],
    source: row?.source || row?.source_platform || "manual",
    read_time_min: row?.read_time_min || row?.reading_time_minutes || 1,
    view_count: row?.view_count || 0,
    published_at: publishedAt,
    thumbnail_url: row?.thumbnail_url || undefined,
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
