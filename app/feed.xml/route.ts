import { createServerClient } from "@/lib/supabase";
import { NextResponse } from "next/server";
import { unstable_noStore as noStore } from "next/cache";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";

export const dynamic = "force-dynamic";

export async function GET() {
  noStore();
  const base = process.env.NEXT_PUBLIC_BASE_URL || "https://banglaaihub.com";
  const posts = await fetchPublishedBlogPosts(createServerClient(), { orderBy: "published_at", limit: 50 });
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const items = (posts || []).map(p => `<item><title>${esc(p.bangla_title)}</title><link>${base}/blog/${p.blog_slug}</link><description>${esc(p.bangla_hook)}</description><pubDate>${new Date(p.published_at).toUTCString()}</pubDate><guid>${base}/blog/${p.blog_slug}</guid></item>`).join("\n");
  return new NextResponse(`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>BanglaAIHub</title><link>${base}</link><description>বাংলায় AI টুলস ও অনলাইন আয়</description><language>bn</language>${items}</channel></rss>`, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "s-maxage=3600" } });
}
