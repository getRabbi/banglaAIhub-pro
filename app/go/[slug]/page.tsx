import { createServerClient } from "@/lib/supabase";
import { redirect } from "next/navigation";
export default async function AffiliateRedirect({ params }: { params: { slug: string } }) {
  const sb = createServerClient();
  const { data: dest } = await sb.rpc("track_affiliate_click", { link_slug: params.slug });
  if (dest) redirect(dest);
  const { data: tool } = await sb.from("tools").select("affiliate_url, website_url").eq("affiliate_slug", params.slug).single();
  if (tool?.affiliate_url) redirect(tool.affiliate_url);
  if (tool?.website_url) redirect(tool.website_url);
  redirect("/tools");
}
