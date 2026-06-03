import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
import { normalizeBlogPost } from "@/lib/schema-normalizers";

const CATEGORY_SLUG_BY_BLOG_TYPE: Record<string, string> = {
  "money-making": "ai-business",
  "ai-tools": "ai-automation",
  "tech-news": "ai-research",
  "product-review": "ai-productivity",
};

function missingColumnName(error: any): string | null {
  const message = String(error?.message || error || "");
  const patterns = [
    /Could not find the '([a-zA-Z0-9_]+)' column/i,
    /column blog_posts\.([a-zA-Z0-9_]+) does not exist/i,
    /column "?([a-zA-Z0-9_]+)"? of relation "?blog_posts"? does not exist/i,
  ];
  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match?.[1]) return match[1];
  }
  return null;
}

function compactPayload(payload: Record<string, any>) {
  return Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined));
}

async function getCategoryId(sb: any, category?: string) {
  const slug = category ? CATEGORY_SLUG_BY_BLOG_TYPE[category] : "";
  if (!slug) return undefined;
  const { data, error } = await sb.from("categories").select("id").eq("slug", slug).limit(1);
  if (error || !data?.[0]?.id) return undefined;
  return data[0].id;
}

function wordCount(text: string) {
  return (text || "").trim().split(/\s+/).filter(Boolean).length;
}

function estimateReadTime(text: string) {
  return Math.max(1, Math.round(wordCount(text) / 180));
}

function buildBlogPostPayload(data: any, categoryId?: number | string) {
  const title = data.bangla_title || data.title_bn || data.title || "";
  const body = data.bangla_body || data.body_bn || data.content_bn || "";
  const hook = data.bangla_hook || data.hook_bn || data.excerpt_bn || "";
  const slug = data.blog_slug || data.slug || "";
  const status = data.status || (data.is_published ? "published" : "draft");
  const readTime = data.read_time_min || data.reading_time_minutes || estimateReadTime(body || hook || title);
  const tags = Array.isArray(data.tags) ? data.tags : [];
  const metaDescription = data.meta_description || hook.slice(0, 155);

  return compactPayload({
    // Current/live schema aliases.
    title,
    slug,
    excerpt_bn: hook,
    content_bn: body,
    reading_time_minutes: readTime,
    word_count: wordCount(body),
    meta_title: title.slice(0, 70),
    meta_description: metaDescription,
    category_id: categoryId,
    tags,
    status,
    scheduled_at: status === "scheduled" ? data.scheduled_at || null : null,
    thumbnail_url: data.thumbnail_url || null,
    thumbnail_alt: data.thumbnail_alt || title,
    og_image_url: data.thumbnail_url || data.og_image_url || null,
    // Legacy schema aliases from supabase_migration.sql.
    title_bn: title,
    body_bn: body,
    hook_bn: hook,
    blog_slug: slug,
    category: data.category,
    read_time_min: readTime,
    is_published: status === "published",
    // Transitional aliases used by older admin/API versions.
    bangla_title: title,
    bangla_body: body,
    bangla_hook: hook,
  });
}

async function updateBlogPostCompatible(sb: any, id: string | number, payload: Record<string, any>) {
  const next = { ...payload };
  for (let i = 0; i < Object.keys(payload).length + 5; i += 1) {
    const { error } = await sb.from("blog_posts").update(next).eq("id", id);
    if (!error) return null;
    const missing = missingColumnName(error);
    if (!missing || !(missing in next)) return error;
    delete next[missing];
  }
  return { message: "Could not update blog post after removing unsupported columns." };
}

async function insertBlogPostCompatible(sb: any, payload: Record<string, any>) {
  const next = { ...payload };
  for (let i = 0; i < Object.keys(payload).length + 5; i += 1) {
    const { data, error } = await sb.from("blog_posts").insert(next).select("*").single();
    if (!error) return { data, error: null };
    const missing = missingColumnName(error);
    if (!missing || !(missing in next)) return { data: null, error };
    delete next[missing];
  }
  return { data: null, error: { message: "Could not insert blog post after removing unsupported columns." } };
}

export async function GET(req: NextRequest) {
  const sb = createServerClient();
  const action = req.nextUrl.searchParams.get("action");

  if (action === "get_post") {
    const id = req.nextUrl.searchParams.get("id");
    const { data } = await sb.from("blog_posts").select("*").eq("id", id).single();
    return NextResponse.json(data ? normalizeBlogPost(data) : data);
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
    const categoryId = await getCategoryId(sb, data?.category);
    const error = await updateBlogPostCompatible(sb, id, buildBlogPostPayload(data, categoryId));
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
      const categoryId = await getCategoryId(sb, category);

      const record = {
        ...buildBlogPostPayload(
          {
            bangla_title: content.bangla_title,
            bangla_body: content.bangla_body,
            bangla_hook: content.bangla_hook,
            meta_description: content.meta_description || content.bangla_hook?.slice(0, 155),
            blog_slug: slug,
            category,
            tags: [category, "manual"],
            read_time_min: readTime,
            status: "published",
            thumbnail_url: "",
          },
          categoryId,
        ),
        source: "manual",
        source_platform: "manual",
        source_url: sourceUrl || "",
        original_title: title,
        original_body: sourceUrl || title,
        source_title: title,
        quality_score: qualityScore,
        quality_grade: qualityGrade,
        engagement_score: 0,
        fb_posted: false,
        published_at: new Date().toISOString(),
      };

      const { data: post, error } = await insertBlogPostCompatible(sb, record);
      if (error) return NextResponse.json({ ok: false, error: error.message });
      const normalized = normalizeBlogPost(post);

      return NextResponse.json({
        ok: true,
        id: post.id,
        slug: normalized.blog_slug,
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
