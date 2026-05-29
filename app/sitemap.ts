import { createServerClient } from "@/lib/supabase";
import { MetadataRoute } from "next";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";
import { CURATED_GUIDES, CURATED_PROMPTS } from "@/lib/curated-resources";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const sb = createServerClient();
  const [blogs, { data: tools }, { data: cats }] = await Promise.all([
    fetchPublishedBlogPosts(sb, { orderBy: "published_at", limit: 500 }),
    sb.from("tools").select("slug, updated_at").eq("status", "published"),
    sb.from("categories").select("slug"),
  ]);
  const statics: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...["/tools", "/blog", "/categories", "/compare", "/top-lists", "/guides", "/make-money", "/deals", "/prompts", "/resources", "/glossary", "/find-tool", "/about", "/contact"].map(p => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
  const blogPages = (blogs || []).map(p => ({ url: `${base}/blog/${p.blog_slug}`, lastModified: new Date(p.published_at), changeFrequency: "weekly" as const, priority: 0.7 }));
  const toolPages = (tools || []).map(t => ({ url: `${base}/tools/${t.slug}`, lastModified: new Date(t.updated_at), changeFrequency: "weekly" as const, priority: 0.7 }));
  const catPages = (cats || []).map(c => ({ url: `${base}/categories/${c.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 }));
  const promptPages = CURATED_PROMPTS.map(p => ({ url: `${base}/prompts/${p.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 }));
  const guidePages = CURATED_GUIDES.map(g => ({ url: `${base}/guides/${g.slug}`, lastModified: new Date(), changeFrequency: "monthly" as const, priority: 0.6 }));
  return [...statics, ...toolPages, ...blogPages, ...catPages, ...promptPages, ...guidePages];
}
