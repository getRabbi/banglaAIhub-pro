import AdminLayout from '@/components/layout/AdminLayout'
import { createAdminClient } from '@/lib/supabase'
import { TrendingUp, Eye, MousePointer, Search, Users } from 'lucide-react'

export default async function AnalyticsPage() {
  const supabase = createAdminClient()
  const last30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()

  const [
    { data: topPosts },
    { data: topTools },
    { data: topSearches },
    { data: topAffiliates },
    { count: totalViews },
    { count: totalSearches },
    { count: subscribers },
  ] = await Promise.all([
    supabase.from('blog_posts').select('id, title, slug, view_count').eq('status', 'published').order('view_count', { ascending: false }).limit(10),
    supabase.from('tools').select('id, name, slug, view_count, affiliate_click_count').eq('status', 'published').order('view_count', { ascending: false }).limit(10),
    supabase.from('search_analytics').select('query').gte('searched_at', last30).limit(200),
    supabase.from('affiliate_links').select('tool_name, slug, click_count').order('click_count', { ascending: false }).limit(10),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'page_view').gte('created_at', last30),
    supabase.from('analytics_events').select('*', { count: 'exact', head: true }).eq('event_type', 'search').gte('created_at', last30),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Count search queries
  const searchCounts: Record<string, number> = {}
  topSearches?.forEach(s => { searchCounts[s.query] = (searchCounts[s.query] || 0) + 1 })
  const sortedSearches = Object.entries(searchCounts).sort((a, b) => b[1] - a[1]).slice(0, 10)

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-bold text-white">Analytics</h1>
          <p className="text-sm text-gray-400 mt-0.5">গত ৩০ দিনের পরিসংখ্যান</p>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Page Views (30d)', value: (totalViews || 0).toLocaleString(), icon: Eye, color: 'text-blue-400' },
            { label: 'Searches (30d)', value: (totalSearches || 0).toLocaleString(), icon: Search, color: 'text-purple-400' },
            { label: 'Subscribers', value: (subscribers || 0).toLocaleString(), icon: Users, color: 'text-green-400' },
            { label: 'Affiliate Clicks', value: (topAffiliates?.reduce((s, l) => s + (l.click_count || 0), 0) || 0).toLocaleString(), icon: MousePointer, color: 'text-orange-400' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="admin-card p-4">
              <Icon className={`w-5 h-5 ${color} mb-2`} />
              <div className="text-2xl font-bold text-white">{value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{label}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Posts */}
          <div className="admin-card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-400" /> Top Posts
            </h2>
            <div className="space-y-2">
              {topPosts?.map((post, i) => (
                <div key={post.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white truncate">{post.title}</div>
                    <div className="text-xs text-gray-500">/{post.slug}</div>
                  </div>
                  <div className="flex items-center gap-1 text-sm font-medium text-blue-400 shrink-0">
                    <Eye className="w-3.5 h-3.5" /> {post.view_count?.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Tools */}
          <div className="admin-card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-green-400" /> Top Tools
            </h2>
            <div className="space-y-2">
              {topTools?.map((tool, i) => (
                <div key={tool.id} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-white">{tool.name}</div>
                  </div>
                  <div className="text-right text-xs">
                    <div className="text-blue-400">{tool.view_count?.toLocaleString()} views</div>
                    <div className="text-green-400">{tool.affiliate_click_count?.toLocaleString()} aff.</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Searches */}
          <div className="admin-card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <Search className="w-4 h-4 text-purple-400" /> Top Searches
            </h2>
            <div className="space-y-2">
              {sortedSearches.map(([query, count], i) => (
                <div key={query} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1 text-sm text-white">{query}</div>
                  <span className="text-sm font-medium text-purple-400">{count}x</span>
                </div>
              ))}
              {sortedSearches.length === 0 && <p className="text-gray-500 text-sm">কোনো search data নেই</p>}
            </div>
          </div>

          {/* Top Affiliate Links */}
          <div className="admin-card p-5">
            <h2 className="font-semibold text-white mb-4 flex items-center gap-2">
              <MousePointer className="w-4 h-4 text-orange-400" /> Top Affiliate Links
            </h2>
            <div className="space-y-2">
              {topAffiliates?.map((link, i) => (
                <div key={link.slug} className="flex items-center gap-3 py-2 border-b border-gray-800 last:border-0">
                  <span className="w-5 h-5 rounded-full bg-gray-800 text-gray-400 text-xs flex items-center justify-center shrink-0">{i + 1}</span>
                  <div className="flex-1">
                    <div className="text-sm text-white">{link.tool_name}</div>
                    <div className="text-xs text-gray-500">/go/{link.slug}</div>
                  </div>
                  <span className="text-sm font-bold text-orange-400">{link.click_count?.toLocaleString()} clicks</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
