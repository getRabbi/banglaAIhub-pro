import AdminLayout from '@/components/layout/AdminLayout'
import { createAdminClient } from '@/lib/supabase'
import { FileText, Wrench, Share2, Users, TrendingUp, Bot, AlertCircle, CheckCircle } from 'lucide-react'
import Link from 'next/link'

export default async function DashboardPage() {
  const supabase = createAdminClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [
    { count: totalPosts },
    { count: totalTools },
    { count: subscribers },
    { count: postsToday },
    { count: pendingQueue },
    { count: failedSocial },
    { data: recentJobs },
    { data: recentPosts },
  ] = await Promise.all([
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('newsletter_subscribers').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('blog_posts').select('*', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
    supabase.from('scrape_queue').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('social_posts').select('*', { count: 'exact', head: true }).eq('status', 'failed'),
    supabase.from('openclaw_jobs').select('*').order('created_at', { ascending: false }).limit(5),
    supabase.from('blog_posts').select('id, title, slug, status, published_at, content_type').order('created_at', { ascending: false }).limit(8),
  ])

  const STATS = [
    { label: 'মোট পোস্ট', value: totalPosts || 0, icon: FileText, color: 'blue', href: '/posts' },
    { label: 'মোট টুলস', value: totalTools || 0, icon: Wrench, color: 'purple', href: '/tools' },
    { label: 'সাবস্ক্রাইবার', value: subscribers || 0, icon: Users, color: 'green', href: '/newsletter' },
    { label: 'আজকের পোস্ট', value: postsToday || 0, icon: TrendingUp, color: 'orange', href: '/posts' },
    { label: 'Scrape Queue', value: pendingQueue || 0, icon: Bot, color: 'yellow', href: '/scrape-queue' },
    { label: 'Failed Posts', value: failedSocial || 0, icon: AlertCircle, color: 'red', href: '/social-posts' },
  ]

  const colorMap: Record<string, string> = {
    blue: 'bg-blue-600/10 text-blue-400',
    purple: 'bg-purple-600/10 text-purple-400',
    green: 'bg-green-600/10 text-green-400',
    orange: 'bg-orange-600/10 text-orange-400',
    yellow: 'bg-yellow-600/10 text-yellow-400',
    red: 'bg-red-600/10 text-red-400',
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Overview</h1>
          <p className="text-gray-400 text-sm mt-1">BanglaAIHub Admin Dashboard</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {STATS.map((stat) => {
            const Icon = stat.icon
            return (
              <Link key={stat.label} href={stat.href}
                className="admin-card p-4 hover:border-gray-700 transition-colors group"
              >
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-3 ${colorMap[stat.color]}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="text-2xl font-bold text-white">{stat.value.toLocaleString()}</div>
                <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
              </Link>
            )
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent OpenClaw Jobs */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-purple-400" /> OpenClaw Jobs
              </h2>
              <Link href="/openclaw-jobs" className="text-xs text-blue-400 hover:text-blue-300">সব দেখুন →</Link>
            </div>
            <div className="space-y-3">
              {recentJobs && recentJobs.length > 0 ? recentJobs.map((job: any) => (
                <div key={job.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div>
                    <div className="text-sm text-white">{job.job_name}</div>
                    <div className="text-xs text-gray-500 mt-0.5">
                      {job.total_published}/{job.posts_target} পোস্ট ·{' '}
                      {new Date(job.created_at).toLocaleString('bn-BD')}
                    </div>
                  </div>
                  <span className={
                    job.status === 'completed' ? 'status-badge-published' :
                    job.status === 'running' ? 'status-badge-running' :
                    job.status === 'failed' ? 'status-badge-failed' :
                    'status-badge-pending'
                  }>
                    {job.status === 'completed' ? '✓ সম্পন্ন' :
                     job.status === 'running' ? '⟳ চলছে' :
                     job.status === 'failed' ? '✗ ব্যর্থ' : '○ অপেক্ষায়'}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-gray-500">কোনো job নেই</p>
              )}
            </div>
          </div>

          {/* Recent Posts */}
          <div className="admin-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" /> সাম্প্রতিক পোস্ট
              </h2>
              <Link href="/posts" className="text-xs text-blue-400 hover:text-blue-300">সব দেখুন →</Link>
            </div>
            <div className="space-y-3">
              {recentPosts && recentPosts.length > 0 ? recentPosts.map((post: any) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-gray-800 last:border-0">
                  <div className="flex-1 min-w-0 mr-3">
                    <div className="text-sm text-white truncate">{post.title}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{post.content_type}</div>
                  </div>
                  <span className={post.status === 'published' ? 'status-badge-published' : post.status === 'draft' ? 'status-badge-draft' : 'status-badge-failed'}>
                    {post.status === 'published' ? 'Published' : post.status === 'draft' ? 'Draft' : post.status}
                  </span>
                </div>
              )) : (
                <p className="text-sm text-gray-500">কোনো পোস্ট নেই</p>
              )}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="admin-card p-5">
          <h2 className="font-semibold text-white mb-4">দ্রুত কাজ</h2>
          <div className="flex flex-wrap gap-3">
            <Link href="/quick-submit" className="admin-btn-primary">⚡ Quick Submit</Link>
            <Link href="/scrape-queue" className="admin-btn-secondary">📥 Scrape Queue</Link>
            <Link href="/tools/new" className="admin-btn-secondary">➕ নতুন টুল</Link>
            <Link href="/openclaw-jobs" className="admin-btn-secondary">🤖 Jobs দেখুন</Link>
            <Link href="/social-posts" className="admin-btn-secondary">📣 Social Posts</Link>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
