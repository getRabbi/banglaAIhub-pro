import { createServerClient } from "@/lib/supabase";
import { NextRequest, NextResponse } from "next/server";
export async function POST(_req: NextRequest, { params }: { params: { slug: string } }) {
  try { await createServerClient().rpc("increment_view", { tbl: "blog_posts", slug_val: params.slug }); return NextResponse.json({ ok: true }); }
  catch { return NextResponse.json({ ok: false }, { status: 500 }); }
}
