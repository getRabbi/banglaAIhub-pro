import { createServerClient } from "@/lib/supabase";
import { normalizeBlogPost } from "@/lib/schema-normalizers";

export const revalidate = 60;

export default async function AdminSocialPosts() {
  const { data: posts } = await createServerClient().from("social_posts").select("*, blog_posts(*)").order("created_at", { ascending: false }).limit(50);

  const STATUS: Record<string, string> = { pending: "bg-yellow-500/20 text-yellow-400", scheduled: "bg-blue-500/20 text-blue-400", posted: "bg-green-500/20 text-green-400", failed: "bg-red-500/20 text-red-400" };

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">📣 Social Posts</h1>
      <div className="glass-card overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="border-b border-brand-border text-left text-gray-500"><th className="px-4 py-3">Blog Post</th><th className="px-4 py-3">Platform</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Retry</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Error</th></tr></thead>
          <tbody>
            {(posts || []).map((p: any) => {
              const post = p.blog_posts ? normalizeBlogPost(p.blog_posts) : null;
              return (
              <tr key={p.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                <td className="px-4 py-3 text-gray-300 text-xs max-w-[200px] truncate">{post?.bangla_title || "-"}</td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.platform}</td>
                <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS[p.status]}`}>{p.status}</span></td>
                <td className="px-4 py-3 text-xs text-gray-500">{p.retry_count}</td>
                <td className="px-4 py-3 text-xs text-gray-600">{p.posted_at ? new Date(p.posted_at).toLocaleString("bn-BD") : "-"}</td>
                <td className="px-4 py-3 text-xs text-red-400 max-w-[200px] truncate">{p.error_message || "-"}</td>
              </tr>
              );
            })}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && <p className="text-center text-gray-600 py-10">কোনো social post নেই</p>}
      </div>
    </div>
  );
}
