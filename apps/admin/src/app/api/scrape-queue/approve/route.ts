import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { geminiGenerate } from '@/lib/gemini'

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

export async function POST(req: NextRequest) {
  try {
    const { id } = await req.json()
    const supabase = createAdminClient()

    const { data: item } = await supabase.from('scrape_queue').select('*').eq('id', id).single()
    if (!item) return NextResponse.json({ error: 'Item not found' }, { status: 404 })

    const { data: settingsRows } = await supabase.from('site_settings').select('key, value')
    const settings: Record<string, any> = {}
    settingsRows?.forEach(r => { settings[r.key] = r.value })

    await supabase.from('scrape_queue').update({ status: 'approved', reviewed_at: new Date().toISOString() }).eq('id', id)

    const prompt = `তুমি BanglaAIHub-এর Bangla AI content writer।

সোর্স: ${item.source_title}
প্ল্যাটফর্ম: ${item.source_platform}
${item.source_content ? `Content: ${item.source_content.substring(0, 400)}` : ''}

বাংলায় পূর্ণ blog post লিখো। কমপক্ষে ${settings.min_word_count || 800} শব্দ।
HTML format: h2, h3, p, ul, li, strong। Heading-এ id attribute।

শুধু JSON দাও (backtick ছাড়া):
{"title":"বাংলা শিরোনাম","slug":"english-slug","excerpt_bn":"সারসংক্ষেপ","content_bn":"<h2 id='s1'>...</h2><p>...</p>","meta_title":"SEO title","meta_description":"SEO desc","tags":["tag1","tag2"]}`

    const text = await geminiGenerate(prompt, 4000)
    const generated = JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())

    let slug = slugify(generated.slug || generated.title)
    const { data: exists } = await supabase.from('blog_posts').select('id').eq('slug', slug).single()
    if (exists) slug = `${slug}-${Date.now()}`

    let thumbnailUrl = null
    if (settings.unsplash_access_key) {
      try {
        const res = await fetch(
          `https://api.unsplash.com/search/photos?query=${encodeURIComponent(item.source_title)}&per_page=1&orientation=landscape`,
          { headers: { Authorization: `Client-ID ${settings.unsplash_access_key}` } }
        )
        const data = await res.json()
        thumbnailUrl = data.results?.[0]?.urls?.regular || null
      } catch {}
    }

    const wordCount = generated.content_bn.replace(/<[^>]*>/g, '').split(/\s+/).length

    const { data: post, error } = await supabase.from('blog_posts').insert({
      title: generated.title, slug, content_type: 'blog',
      excerpt_bn: generated.excerpt_bn, content_bn: generated.content_bn,
      thumbnail_url: thumbnailUrl,
      reading_time_minutes: Math.max(3, Math.ceil(wordCount / 200)),
      word_count: wordCount,
      meta_title: generated.meta_title, meta_description: generated.meta_description,
      tags: generated.tags || [], has_affiliate_links: true, affiliate_disclosure: true,
      source_platform: item.source_platform, source_url: item.source_url, source_title: item.source_title,
      status: 'published', published_at: new Date().toISOString(),
    }).select().single()

    if (error) throw new Error(error.message)

    await supabase.from('scrape_queue').update({ status: 'published', generated_blog_id: post.id, published_at: new Date().toISOString() }).eq('id', id)
    await supabase.from('published_topics').insert({ title: generated.title, slug, keywords: generated.tags || [], blog_post_id: post.id })

    return NextResponse.json({ success: true, blog_slug: slug, blog_id: post.id })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
