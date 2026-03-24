'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Loader2, Save, Eye, RefreshCw, Calendar } from 'lucide-react'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function EditPostPage({ params }: { params: { id: string } }) {
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [regenerating, setRegenerating] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('id', params.id).single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [params.id])

  const save = async () => {
    setSaving(true)
    const { error } = await supabase.from('blog_posts').update({
      title: post.title,
      slug: post.slug,
      excerpt_bn: post.excerpt_bn,
      content_bn: post.content_bn,
      meta_title: post.meta_title,
      meta_description: post.meta_description,
      status: post.status,
      tags: post.tags,
      scheduled_at: post.scheduled_at || null,
      published_at: post.status === 'published' && !post.published_at ? new Date().toISOString() : post.published_at,
      updated_at: new Date().toISOString(),
    }).eq('id', params.id)
    if (error) toast.error(error.message)
    else toast.success('সংরক্ষণ হয়েছে!')
    setSaving(false)
  }

  const regenerate = async () => {
    if (!confirm('AI দিয়ে নতুন করে লিখবে? বর্তমান content replace হবে।')) return
    setRegenerating(true)
    try {
      const res = await fetch('/api/quick-submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source_title: post.title,
          main_idea: post.excerpt_bn || post.title,
          content_type: post.content_type,
          rewrite_style: 'expand_full_blog',
          publish_now: false,
          generate_facebook_post: false,
          source_platform: post.source_platform || 'manual',
        }),
      })
      const data = await res.json()
      if (data.blog_slug) {
        const { data: newPost } = await supabase.from('blog_posts').select('content_bn, excerpt_bn').eq('slug', data.blog_slug).single()
        if (newPost) {
          setPost((p: any) => ({ ...p, content_bn: newPost.content_bn, excerpt_bn: newPost.excerpt_bn }))
          toast.success('নতুন content তৈরি হয়েছে!')
        }
      }
    } catch (e: any) { toast.error(e.message) }
    setRegenerating(false)
  }

  const up = (key: string, val: any) => setPost((p: any) => ({ ...p, [key]: val }))

  if (loading) return <AdminLayout><div className="flex justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-blue-400" /></div></AdminLayout>
  if (!post) return <AdminLayout><div className="text-center py-20 text-gray-500">পোস্ট পাওয়া যায়নি</div></AdminLayout>

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white">পোস্ট সম্পাদনা</h1>
          <div className="flex gap-2">
            <button onClick={regenerate} disabled={regenerating} className="admin-btn-secondary text-xs">
              {regenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              AI দিয়ে নতুন লিখুন
            </button>
            <a href={`${process.env.NEXT_PUBLIC_SITE_URL}/blog/${post.slug}`} target="_blank" rel="noopener noreferrer"
              className="admin-btn-secondary text-xs"><Eye className="w-4 h-4" /> Preview
            </a>
            <button onClick={save} disabled={saving} className="admin-btn-primary">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} সংরক্ষণ
            </button>
          </div>
        </div>

        <div className="admin-card p-5 space-y-4">
          <div>
            <label className="admin-label">শিরোনাম</label>
            <input className="admin-input text-base font-medium" value={post.title} onChange={e => up('title', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Slug</label>
              <input className="admin-input font-mono text-xs" value={post.slug} onChange={e => up('slug', e.target.value)} />
            </div>
            <div>
              <label className="admin-label">Status</label>
              <select className="admin-input" value={post.status} onChange={e => up('status', e.target.value)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          {post.status === 'draft' && (
            <div>
              <label className="admin-label flex items-center gap-2"><Calendar className="w-4 h-4" /> Schedule করুন (optional)</label>
              <input type="datetime-local" className="admin-input" value={post.scheduled_at || ''}
                onChange={e => up('scheduled_at', e.target.value)} />
            </div>
          )}
          <div>
            <label className="admin-label">সারসংক্ষেপ</label>
            <textarea rows={3} className="admin-input resize-none" value={post.excerpt_bn || ''}
              onChange={e => up('excerpt_bn', e.target.value)} />
          </div>
          <div>
            <label className="admin-label">Content (HTML)</label>
            <textarea rows={20} className="admin-input resize-y font-mono text-xs"
              value={post.content_bn || ''} onChange={e => up('content_bn', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="admin-label">Meta Title</label>
              <input className="admin-input" value={post.meta_title || ''} onChange={e => up('meta_title', e.target.value)} />
              <p className="text-xs text-gray-600 mt-1">{(post.meta_title || '').length}/60</p>
            </div>
            <div>
              <label className="admin-label">Meta Description</label>
              <input className="admin-input" value={post.meta_description || ''} onChange={e => up('meta_description', e.target.value)} />
              <p className="text-xs text-gray-600 mt-1">{(post.meta_description || '').length}/160</p>
            </div>
          </div>
          <div>
            <label className="admin-label">Tags (comma separated)</label>
            <input className="admin-input" value={(post.tags || []).join(', ')}
              onChange={e => up('tags', e.target.value.split(',').map((t: string) => t.trim()).filter(Boolean))} />
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
