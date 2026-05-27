import { createServerClient } from "@/lib/supabase";
import { fetchPublishedBlogPostBySlug } from "@/lib/blog-data";
import { NextRequest, NextResponse } from "next/server";

export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const slug = decodeURIComponent(params.slug);

  try {
    const { error } = await sb.rpc("increment_view", { tbl: "blog_posts", slug_val: slug });
    if (!error) return NextResponse.json({ ok: true });
  } catch {
    // Fall through to a schema-agnostic update below.
  }

  const post = await fetchPublishedBlogPostBySlug(sb, slug);
  if (!post?.id) return NextResponse.json({ ok: false }, { status: 404 });

  const { error } = await sb.from("blog_posts").update({ view_count: (post.view_count || 0) + 1 }).eq("id", post.id);
  return NextResponse.json({ ok: !error }, { status: error ? 500 : 200 });
}
