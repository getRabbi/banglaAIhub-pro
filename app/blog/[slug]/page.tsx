import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createServerClient();
  const { data: post } = await sb.from("blog_posts").select("bangla_title, meta_description, blog_slug, category").eq("blog_slug", params.slug).eq("status", "published").single();
  if (!post) return { title: "পোস্ট পাওয়া যায়নি" };
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
  const { data: post } = await sb.from("blog_posts").select("*").eq("blog_slug", params.slug).eq("status", "published").single();
  if (!post) notFound();

  const [{ data: related }, { data: trending }] = await Promise.all([
    sb.from("blog_posts").select("id, bangla_title, bangla_hook, blog_slug, category, read_time_min, view_count, thumbnail_url, published_at").eq("status", "published").eq("category", post.category).neq("id", post.id).order("published_at", { ascending: false }).limit(6),
    sb.from("blog_posts").select("id, bangla_title, bangla_hook, blog_slug, category, view_count, read_time_min, published_at").eq("status", "published").neq("id", post.id).order("view_count", { ascending: false }).limit(5),
  ]);

  // JSON-LD
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const schema = { "@context": "https://schema.org", "@type": "Article", headline: post.bangla_title, description: post.meta_description, url: `${base}/blog/${post.blog_slug}`, datePublished: post.published_at, publisher: { "@type": "Organization", name: "BanglaAIHub" } };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BlogPostClient post={post} relatedPosts={related || []} trendingPosts={trending || []} />
    </>
  );
}
