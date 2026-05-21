import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const action = req.nextUrl.searchParams.get("action");

  if (action === "get_post") {
    const id = req.nextUrl.searchParams.get("id");
    const { data } = await sb.from("blog_posts").select("*").eq("id", id).single();
    return NextResponse.json(data);
  }

  if (action === "get_tool") {
    const id = req.nextUrl.searchParams.get("id");
    const { data } = await sb.from("tools").select("*").eq("id", id).single();
    return NextResponse.json(data);
  }

  if (action === "get_categories") {
    const { data } = await sb.from("categories").select("*").order("sort_order");
    return NextResponse.json(data || []);
  }

  if (action === "get_settings") {
    const { data } = await sb.from("site_settings").select("*");
    return NextResponse.json(data || []);
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const sb = createServerClient();
  const body = await req.json();
  const { action, id, data } = body;

  // ─── Posts ───
  if (action === "update_post") {
    const { bangla_title, bangla_body, bangla_hook, meta_description, blog_slug, category, tags, status, scheduled_at, thumbnail_url } = data;
    const { error } = await sb.from("blog_posts").update({ bangla_title, bangla_body, bangla_hook, meta_description, blog_slug, category, tags, status, scheduled_at, thumbnail_url }).eq("id", id);
    return NextResponse.json({ ok: !error, error: error?.message });
  }

  // ─── Tools ───
  if (action === "create_tool") {
    const { data: result, error } = await sb.from("tools").insert(data).select("id").single();
    return NextResponse.json({ ok: !error, id: result?.id, error: error?.message });
  }

  if (action === "update_tool") {
    const { error } = await sb.from("tools").update(data).eq("id", id);
    return NextResponse.json({ ok: !error, error: error?.message });
  }

  // ─── Bulk Import Tools ───
  if (action === "bulk_import_tools") {
    try {
      const lines = body.csv.trim().split("\n").filter((l: string) => l.trim());
      const tools = lines.map((line: string) => {
        const [name, slug, tagline_bn, pricing, website_url, affiliate_url, category_id] = line.split(",").map((s: string) => s.trim());
        return { name, slug, tagline_bn, pricing: pricing || "free", website_url: website_url || "", affiliate_url: affiliate_url || "", category_id: category_id ? Number(category_id) : null, is_active: true };
      });
      const { error } = await sb.from("tools").insert(tools);
      return NextResponse.json({ ok: !error, count: tools.length, error: error?.message });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e.message });
    }
  }

  // ─── Categories ───
  if (action === "create_category") {
    const { error } = await sb.from("categories").insert(data);
    return NextResponse.json({ ok: !error, error: error?.message });
  }

  if (action === "update_category") {
    const { error } = await sb.from("categories").update(data).eq("id", id);
    return NextResponse.json({ ok: !error, error: error?.message });
  }

  // ─── Scrape Queue ───
  if (action === "update_scrape_queue") {
    const { error } = await sb.from("scrape_queue").update(data).eq("id", id);
    return NextResponse.json({ ok: !error, error: error?.message });
  }

  // ─── Settings ───
  if (action === "save_settings") {
    const entries = Object.entries(data as Record<string, string>);
    for (const [key, value] of entries) {
      await sb.from("site_settings").upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });
    }
    return NextResponse.json({ ok: true });
  }

  // ─── Quick Submit ───
  if (action === "quick_submit") {
    try {
      const { url: sourceUrl, topic, category } = body;
      const title = topic || sourceUrl || "Manual submission";
      
      // Call OpenAI to generate content
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: process.env.OPENAI_MODEL || "gpt-4o-mini",
          messages: [
            { role: "system", content: "তুমি একজন expert Bangla content writer। JSON format এ return করো: {\"bangla_title\": \"...\", \"bangla_body\": \"... (minimum 1000 words, ## headings, **bold**, practical tips, Bangladesh context)\", \"bangla_hook\": \"... (2-3 line Facebook hook with emoji)\", \"meta_description\": \"... (120-155 chars)\"}" },
            { role: "user", content: `Category: ${category}\nTopic: ${title}\n${sourceUrl ? `Source: ${sourceUrl}` : ""}\n\nBangla তে একটা complete blog post লেখো।` }
          ],
          temperature: 0.8,
          max_tokens: 4096,
          response_format: { type: "json_object" },
        }),
      });

      const aiData = await openaiRes.json();
      const content = JSON.parse(aiData.choices[0].message.content);

      // Generate slug
      const slug = content.bangla_title
        .replace(/[^\w\s\u0980-\u09FF-]/g, "")
        .replace(/[\s_]+/g, "-")
        .replace(/-+/g, "-")
        .trim().toLowerCase()
        .slice(0, 60) + "-" + Date.now().toString(36);

      // Quality score (simple)
      const wordCount = content.bangla_body.split(" ").length;
      const headingCount = (content.bangla_body.match(/## /g) || []).length;
      const qualityScore = Math.min(100, (wordCount >= 500 ? 30 : 15) + (headingCount >= 3 ? 20 : 10) + (content.bangla_hook?.length > 50 ? 15 : 5) + (content.meta_description?.length > 50 ? 10 : 5) + 20);
      const qualityGrade = qualityScore >= 80 ? "A" : qualityScore >= 65 ? "B" : qualityScore >= 50 ? "C" : "D";

      // Read time
      const readTime = Math.max(1, Math.round(wordCount / 180));

      const record = {
        source: sourceUrl ? "manual" : "manual",
        source_url: sourceUrl || "",
        original_title: title,
        bangla_title: content.bangla_title,
        bangla_body: content.bangla_body,
        bangla_hook: content.bangla_hook,
        meta_description: content.meta_description || content.bangla_hook?.slice(0, 155),
        blog_slug: slug,
        category,
        tags: [category, "manual"],
        read_time_min: readTime,
        quality_score: qualityScore,
        quality_grade: qualityGrade,
        status: "published",
        published_at: new Date().toISOString(),
      };

      const { data: post, error } = await sb.from("blog_posts").insert(record).select("id, blog_slug").single();
      if (error) return NextResponse.json({ ok: false, error: error.message });

      return NextResponse.json({
        ok: true,
        id: post.id,
        slug: post.blog_slug,
        title: content.bangla_title,
        quality_score: qualityScore,
        quality_grade: qualityGrade,
      });
    } catch (e: any) {
      return NextResponse.json({ ok: false, error: e.message });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
