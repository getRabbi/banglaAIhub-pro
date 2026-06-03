import { normalizeBlogPost, normalizeBlogPosts } from "@/lib/schema-normalizers";

const BLOG_SELECTS = ["*, categories(slug, name_bn, icon)", "*"];

type PublishedBlogOptions = {
  limit?: number;
  orderBy?: string;
  ascending?: boolean;
  excludeId?: number | string;
};

type BlogListOptions = PublishedBlogOptions & {
  status?: string;
};

function applyPublishedOptions(query: any, options: PublishedBlogOptions) {
  let next = query;
  if (options.excludeId !== undefined) next = next.neq("id", options.excludeId);
  if (options.orderBy) next = next.order(options.orderBy, { ascending: options.ascending ?? false });
  if (options.limit) next = next.limit(options.limit);
  return next;
}

async function runPublishedListQuery(sb: any, statusColumn: "status" | "is_published", options: PublishedBlogOptions) {
  let lastError = null;
  for (const select of BLOG_SELECTS) {
    let query = sb.from("blog_posts").select(select);
    query = statusColumn === "status" ? query.eq("status", "published") : query.eq("is_published", true);
    const { data, error } = await applyPublishedOptions(query, options);
    if (!error) return { data, error };
    lastError = error;
  }
  return { data: null, error: lastError };
}

export async function fetchBlogPosts(sb: any, options: BlogListOptions = {}) {
  let primary = { data: null as any[] | null, error: null as any };
  for (const select of BLOG_SELECTS) {
    let query = sb.from("blog_posts").select(select);
    if (options.status) query = query.eq("status", options.status);
    primary = await applyPublishedOptions(query, options);
    if (!primary.error) return normalizeBlogPosts(primary.data);
  }

  if (options.status === "published") {
    for (const select of BLOG_SELECTS) {
      let fallbackQuery = sb.from("blog_posts").select(select).eq("is_published", true);
      const fallback = await applyPublishedOptions(fallbackQuery, options);
      if (!fallback.error) return normalizeBlogPosts(fallback.data);
    }
  }

  return [];
}

export async function fetchPublishedBlogPosts(sb: any, options: PublishedBlogOptions = {}) {
  const primary = await runPublishedListQuery(sb, "status", options);
  if (!primary.error) return normalizeBlogPosts(primary.data);

  const fallback = await runPublishedListQuery(sb, "is_published", options);
  if (!fallback.error) return normalizeBlogPosts(fallback.data);

  return [];
}

async function runPublishedSlugQuery(sb: any, slugColumn: "slug" | "blog_slug", statusColumn: "status" | "is_published", slug: string) {
  let lastError = null;
  for (const select of BLOG_SELECTS) {
    let query = sb.from("blog_posts").select(select).eq(slugColumn, slug);
    query = statusColumn === "status" ? query.eq("status", "published") : query.eq("is_published", true);
    const { data, error } = await query.limit(1);
    if (!error) return { data, error };
    lastError = error;
  }
  return { data: null, error: lastError };
}

export async function fetchPublishedBlogPostBySlug(sb: any, slug: string) {
  const attempts: Array<["slug" | "blog_slug", "status" | "is_published"]> = [
    ["slug", "status"],
    ["blog_slug", "status"],
    ["slug", "is_published"],
    ["blog_slug", "is_published"],
  ];

  for (const [slugColumn, statusColumn] of attempts) {
    const { data, error } = await runPublishedSlugQuery(sb, slugColumn, statusColumn, slug);
    if (!error && data?.[0]) return normalizeBlogPost(data[0]);
  }

  return null;
}
