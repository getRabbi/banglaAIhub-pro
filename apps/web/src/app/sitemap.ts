import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createClient()
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://banglaAIhub.com'

  const [{ data: tools }, { data: posts }, { data: categories }] = await Promise.all([
    supabase.from('tools').select('slug, updated_at').eq('status', 'published'),
    supabase.from('blog_posts').select('slug, updated_at, published_at').eq('status', 'published'),
    supabase.from('categories').select('slug, updated_at'),
  ])

  const static_pages = [
    '', '/tools', '/categories', '/compare', '/top-lists',
    '/guides', '/make-money', '/blog', '/deals', '/resources',
    '/prompts', '/find-tool', '/glossary', '/newsletter', '/about',
  ].map(path => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: path === '' ? 1 : 0.8,
  }))

  const tool_pages = (tools || []).map(tool => ({
    url: `${base}/tools/${tool.slug}`,
    lastModified: new Date(tool.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const post_pages = (posts || []).map(post => ({
    url: `${base}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.published_at || new Date()),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const cat_pages = (categories || []).map(cat => ({
    url: `${base}/categories/${cat.slug}`,
    lastModified: new Date(cat.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [...static_pages, ...tool_pages, ...post_pages, ...cat_pages]
}
