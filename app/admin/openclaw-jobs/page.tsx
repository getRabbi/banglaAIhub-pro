import { createServerClient } from "@/lib/supabase";
export const revalidate = 60;
export default async function AdminOpenClawJobs() {
  const sb = createServerClient();
  const { data: jobs } = await sb.from("openclaw_jobs").select("*").order("started_at", { ascending: false }).limit(30);
  const STATUS: Record<string, string> = { running: "bg-blue-500/20 text-blue-400 animate-pulse", completed: "bg-green-500/20 text-green-400", failed: "bg-red-500/20 text-red-400" };
  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">🔁 OpenClaw Jobs</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">#</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Stats</th><th className="px-4 py-3">Started</th><th className="px-4 py-3">Duration</th><th className="px-4 py-3">Error</th></tr></thead>
          <tbody>
            {(jobs || []).map((j: any) => {
              const s = j.stats || {};
              const dur = j.completed_at && j.started_at ? Math.round((new Date(j.completed_at).getTime() - new Date(j.started_at).getTime()) / 1000) : null;
              return (
                <tr key={j.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3 text-gray-400">{j.id}</td>
                  <td className="px-4 py-3 text-gray-300">{j.job_type}</td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[j.status]}`}>{j.status}</span></td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {s.scraped !== undefined && <span>📡{s.scraped} </span>}
                    {s.published !== undefined && <span>📝{s.published} </span>}
                    {s.fb_posted !== undefined && <span>📘{s.fb_posted} </span>}
                    {s.errors?.length > 0 && <span className="text-red-400">❌{s.errors.length}</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">{new Date(j.started_at).toLocaleString("bn-BD")}</td>
                  <td className="px-4 py-3 text-xs text-gray-500">{dur ? `${dur}s` : "-"}</td>
                  <td className="px-4 py-3 text-xs text-red-400 max-w-[150px] truncate">{j.error_message || "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!jobs || jobs.length === 0) && <p className="text-center text-gray-600 py-10">কোনো job রেকর্ড নেই</p>}
      </div>
    </div>
  );
}
