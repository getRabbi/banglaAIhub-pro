import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { normalizeBlogPost, normalizeBlogPosts } from "@/lib/schema-normalizers";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createServerClient();
  const slug = decodeURIComponent(params.slug);
  const { data } = await sb.from("blog_posts").select("title, slug, excerpt_bn, meta_description, tags, categories(slug)").eq("slug", slug).eq("status", "published").single();
  if (!data) return { title: "পোস্ট পাওয়া যায়নি" };
  const post = normalizeBlogPost(data);
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  return {
    title: post.bangla_title,
    description: post.meta_description,
    openGraph: { title: post.bangla_title, description: post.meta_description, url: `${base}/blog/${post.blog_slug}`, type: "article", images: [`${base}/api/og/${post.blog_slug}`] },
    twitter: { card: "summary_large_image", title: post.bangla_title, description: post.meta_description, images: [`${base}/api/og/${post.blog_slug}`] },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const slug = decodeURIComponent(params.slug);
  const { data: rawPost } = await sb.from("blog_posts").select("*, categories(slug, name_bn, icon)").eq("slug", slug).eq("status", "published").single();
  if (!rawPost) notFound();
  const post = normalizeBlogPost(rawPost);

  const [{ data: rawRelated }, { data: rawTrending }] = await Promise.all([
    sb.from("blog_posts").select("id, title, slug, excerpt_bn, category_id, tags, source_platform, reading_time_minutes, view_count, thumbnail_url, published_at, created_at, categories(slug, name_bn, icon)").eq("status", "published").neq("id", post.id).order("published_at", { ascending: false }).limit(12),
    sb.from("blog_posts").select("id, title, slug, excerpt_bn, category_id, tags, source_platform, view_count, reading_time_minutes, published_at, created_at, categories(slug, name_bn, icon)").eq("status", "published").neq("id", post.id).order("view_count", { ascending: false }).limit(5),
  ]);
  const related = normalizeBlogPosts(rawRelated).filter((item) => item.category === post.category).slice(0, 6);
  const trending = normalizeBlogPosts(rawTrending);

  // JSON-LD
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.bangla_title, description: post.meta_description, url: `${base}/blog/${post.blog_slug}`, datePublished: post.published_at, publisher: { "@type": "Organization", name: "BanglaAIHub" } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BlogPostClient post={post} relatedPosts={related} trendingPosts={trending} />
    </>
  );
}
