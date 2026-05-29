import { createServerClient } from "@/lib/supabase";
import { getCuratedPromptBySlug } from "@/lib/curated-resources";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type");
  const slug = req.nextUrl.searchParams.get("slug");
  const sb = createServerClient();
  if (type === "prompt" && slug) {
    let { data, error } = await sb.from("prompts").select("*").eq("slug", slug).eq("is_active", true).single();
    if (error) {
      const fallback = await sb.from("prompts").select("*").eq("slug", slug).eq("is_published", true).single();
      data = fallback.data;
    }
    if (data) {
      try {
        await sb.rpc("increment_view", { tbl: "prompts", slug_val: slug });
      } catch {
        // View counts should not block the content response.
      }
      return NextResponse.json(data);
    }
    const curatedPrompt = getCuratedPromptBySlug(slug);
    if (curatedPrompt) return NextResponse.json(curatedPrompt);
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  return NextResponse.json({ error: "invalid request" }, { status: 400 });
}
