import { ImageResponse } from "next/og";
import { createClient } from "@supabase/supabase-js";
import { NextRequest } from "next/server";
export const runtime = "edge";
const COLORS: Record<string, { bg: string; ac: string }> = { "money-making": { bg: "#064e3b", ac: "#10b981" }, "ai-tools": { bg: "#2e1065", ac: "#8b5cf6" }, "tech-news": { bg: "#1e3a5f", ac: "#3b82f6" }, "product-review": { bg: "#451a03", ac: "#f59e0b" } };
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);
  const { data } = await sb.from("blog_posts").select("bangla_title,category,read_time_min").eq("blog_slug", params.slug).single();
  // Also try tools
  const { data: tool } = !data ? await sb.from("tools").select("name, tagline_bn").eq("slug", params.slug).single() : { data: null };
  const title = data?.bangla_title || tool?.name || "BanglaAIHub";
  const c = COLORS[data?.category || "tech-news"] || COLORS["tech-news"];
  return new ImageResponse(
    (<div style={{ width: 1200, height: 630, display: "flex", flexDirection: "column", justifyContent: "space-between", padding: 60, background: `linear-gradient(135deg, ${c.bg} 0%, #0a0a0f 100%)`, fontFamily: "sans-serif" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}><div style={{ padding: "8px 20px", borderRadius: 999, border: `2px solid ${c.ac}`, color: c.ac, fontSize: 22 }}>{(data?.category || "").replace("-", " ").toUpperCase()}</div></div>
      <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", lineHeight: 1.3, maxHeight: 280, overflow: "hidden" }}>{title.length > 80 ? title.slice(0, 80) + "..." : title}</div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}><div style={{ fontSize: 28, fontWeight: 700, color: "#fff" }}>📝 BanglaAIHub</div></div>
    </div>),
    { width: 1200, height: 630 }
  );
}
