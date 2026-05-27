import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { fetchPublishedBlogPosts } from "@/lib/blog-data";
import { normalizeTools } from "@/lib/schema-normalizers";
export async function GET(req: NextRequest) {
  const key = req.nextUrl.searchParams.get("key");
  if (key !== (process.env.ANALYTICS_SECRET_KEY || "openclaw-admin")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const sb = createServerClient();
  const [posts, { data: tools }, { data: clicks }] = await Promise.all([
    fetchPublishedBlogPosts(sb, { orderBy: "published_at", limit: 1000 }),
    sb.from("tools").select("id,view_count,click_count,status").eq("status", "published"),
    sb.from("affiliate_clicks").select("id").gte("clicked_at", new Date(Date.now() - 30 * 86400000).toISOString()),
  ]);
  const p = posts, t = normalizeTools(tools);
  const catStats: Record<string, { count: number; views: number }> = {};
  p.forEach(x => { if (!catStats[x.category]) catStats[x.category] = { count: 0, views: 0 }; catStats[x.category].count++; catStats[x.category].views += x.view_count || 0; });
  return NextResponse.json({
    overview: { total_posts: p.length, total_post_views: p.reduce((s, x) => s + (x.view_count || 0), 0), total_tools: t.length, total_tool_views: t.reduce((s, x) => s + (x.view_count || 0), 0), tracked_clicks_30d: (clicks || []).length, fb_posted: 0 },
    category_breakdown: catStats,
    generated_at: new Date().toISOString(),
  });
}
