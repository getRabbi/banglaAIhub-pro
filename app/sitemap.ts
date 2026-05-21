import { createServerClient } from "@/lib/supabase";
import { MetadataRoute } from "next";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const sb = createServerClient();
  const [{ data: blogs }, { data: tools }, { data: cats }] = await Promise.all([
    sb.from("blog_posts").select("blog_slug, published_at").eq("status", "published").order("published_at", { ascending: false }),
    sb.from("tools").select("slug, updated_at").eq("is_active", true),
    sb.from("categories").select("slug").eq("is_active", true),
  ]);
  const statics: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    ...["/tools", "/blog", "/categories", "/compare", "/top-lists", "/guides", "/make-money", "/deals", "/prompts", "/resources", "/glossary", "/find-tool", "/about", "/contact"].map(p => ({ url: `${base}${p}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
  const blogPages = (blogs || []).map(p => ({ url: `${base}/blog/${p.blog_slug}`, lastModified: new Date(p.published_at), changeFrequency: "weekly" as const, priority: 0.7 }));
  const toolPages = (tools || []).map(t => ({ url: `${base}/tools/${t.slug}`, lastModified: new Date(t.updated_at), changeFrequency: "weekly" as const, priority: 0.7 }));
  const catPages = (cats || []).map(c => ({ url: `${base}/categories/${c.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.6 }));
  return [...statics, ...toolPages, ...blogPages, ...catPages];
}
