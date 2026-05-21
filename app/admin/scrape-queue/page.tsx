import { createServerClient } from "@/lib/supabase";
import ScrapeQueueClient from "./ScrapeQueueClient";
export const revalidate = 60;
export default async function ScrapeQueuePage() {
  const { data: items } = await createServerClient().from("scrape_queue").select("*").order("created_at", { ascending: false }).limit(50);
  return <ScrapeQueueClient items={items || []} />;
}
