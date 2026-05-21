import { createServerClient } from "@/lib/supabase";
import Link from "next/link";
import { BLOG_CATEGORIES } from "@/lib/constants";

export const revalidate = 60;

export default async function AdminPosts({ searchParams }: { searchParams: { status?: string } }) {
  const sb = createServerClient();
  let query = sb.from("blog_posts").select("id, bangla_title, blog_slug, category, status, source, view_count, fb_posted, quality_score, quality_grade, published_at, created_at").order("created_at", { ascending: false }).limit(50);
  if (searchParams.status) query = query.eq("status", searchParams.status);

  const { data: posts } = await query;

  const STATUS_STYLES: Record<string, string> = {
    published: "bg-green-500/20 text-green-400",
    draft: "bg-gray-500/20 text-gray-400",
    scheduled: "bg-blue-500/20 text-blue-400",
    archived: "bg-red-500/20 text-red-400",
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-white">📝 Posts Manager</h1>
        <div className="flex gap-2">
          {["", "published", "draft", "scheduled", "archived"].map((s) => (
            <Link key={s} href={`/admin/posts${s ? `?status=${s}` : ""}`} className={`px-3 py-1.5 text-xs rounded-full border transition-all ${(searchParams.status || "") === s ? "bg-white/10 text-white border-white/20" : "text-gray-500 border-brand-border hover:bg-white/5"}`}>
              {s || "All"}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-border text-left text-gray-500">
              <th className="px-4 py-3 font-medium">Title</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Category</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Source</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Quality</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">Views</th>
              <th className="px-4 py-3 font-medium hidden md:table-cell">FB</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {(posts || []).map((p: any) => {
              const cat = BLOG_CATEGORIES[p.category as keyof typeof BLOG_CATEGORIES];
              return (
                <tr key={p.id} className="border-b border-brand-border/50 hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <Link href={`/admin/posts/${p.id}`} className="text-gray-200 hover:text-white font-medium line-clamp-1">{p.bangla_title}</Link>
                    <p className="text-xs text-gray-600 mt-0.5">{new Date(p.created_at).toLocaleDateString("bn-BD")}</p>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{cat?.emoji} {cat?.label}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-600">{p.source}</span></td>
                  <td className="px-4 py-3"><span className={`text-xs px-2 py-0.5 rounded-full ${STATUS_STYLES[p.status] || STATUS_STYLES.draft}`}>{p.status}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{p.quality_grade || "-"} ({p.quality_score || 0})</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className="text-xs text-gray-500">{p.view_count}</span></td>
                  <td className="px-4 py-3 hidden md:table-cell"><span className={`text-xs ${p.fb_posted ? "text-green-400" : "text-gray-600"}`}>{p.fb_posted ? "✓" : "—"}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link href={`/admin/posts/${p.id}`} className="text-xs text-brand-electric hover:underline">Edit</Link>
                      <Link href={`/blog/${p.blog_slug}`} target="_blank" className="text-xs text-gray-500 hover:text-gray-300">View</Link>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {(!posts || posts.length === 0) && <p className="text-center text-gray-600 py-10">কোনো পোস্ট নেই</p>}
      </div>
    </div>
  );
}
