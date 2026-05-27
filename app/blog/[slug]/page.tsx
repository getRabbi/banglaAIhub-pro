import { createServerClient } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import BlogPostClient from "./BlogPostClient";
import { fetchPublishedBlogPostBySlug, fetchPublishedBlogPosts } from "@/lib/blog-data";

export const revalidate = 3600;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const sb = createServerClient();
  const slug = decodeURIComponent(params.slug);
  const post = await fetchPublishedBlogPostBySlug(sb, slug);
  if (!post) return { title: "পোস্ট পাওয়া যায়নি" };

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const image = post.og_image_url || post.thumbnail_url || `${base}/api/og/${post.blog_slug}`;
  return {
    title: post.bangla_title,
    description: post.meta_description,
    openGraph: { title: post.bangla_title, description: post.meta_description, url: `${base}/blog/${post.blog_slug}`, type: "article", images: [image] },
    twitter: { card: "summary_large_image", title: post.bangla_title, description: post.meta_description, images: [image] },
  };
}

export default async function BlogPost({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const slug = decodeURIComponent(params.slug);
  const post = await fetchPublishedBlogPostBySlug(sb, slug);
  if (!post) notFound();

  const [rawRelated, trending] = await Promise.all([
    fetchPublishedBlogPosts(sb, { orderBy: "published_at", excludeId: post.id, limit: 12 }),
    fetchPublishedBlogPosts(sb, { orderBy: "view_count", excludeId: post.id, limit: 5 }),
  ]);
  const related = rawRelated.filter((item) => item.category === post.category).slice(0, 6);

  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.bangla_title,
    description: post.meta_description,
    url: `${base}/blog/${post.blog_slug}`,
    image: post.og_image_url || post.thumbnail_url || `${base}/api/og/${post.blog_slug}`,
    datePublished: post.published_at,
    publisher: { "@type": "Organization", name: "BanglaAIHub" },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <BlogPostClient post={post} relatedPosts={related} trendingPosts={trending} />
    </>
  );
}
