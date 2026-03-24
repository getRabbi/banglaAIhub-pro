import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'
import { geminiGenerate } from '@/lib/gemini'

function checkAuth(req: NextRequest): boolean {
  const secret = req.headers.get('x-admin-secret')
  return secret === process.env.ADMIN_SECRET || process.env.NODE_ENV === 'development'
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

function estimateReadingTime(text: string): number {
  return Math.max(3, Math.ceil(text.split(/\s+/).length / 200))
}

async function fetchUnsplashThumbnail(query: string, accessKey: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
      { headers: { Authorization: `Client-ID ${accessKey}` } }
    )
    const data = await res.json()
    return data.results?.[0]?.urls?.regular || null
  } catch { return null }
}

async function postToFacebook(pageId: string, token: string, message: string, imageUrl?: string): Promise<string | null> {
  try {
    const endpoint = imageUrl ? `https://graph.facebook.com/${pageId}/photos` : `https://graph.facebook.com/${pageId}/feed`
    const body: Record<string, string> = { message, access_token: token }
    if (imageUrl) body.url = imageUrl
    const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await res.json()
    return data.id || data.post_id || null
  } catch { return null }
}

async function generateBlogContent(form: any, settings: any) {
  const styleMap: Record<string, string> = {
    expand_full_blog: `পূর্ণ ব্লগ পোস্ট লিখুন। কমপক্ষে ${settings.min_word_count || 800} শব্দ।`,
    rewrite_professionally: 'প্রফেশনালভাবে লিখুন। Clear structure সহ।',
    affiliate_focused: 'Affiliate conversion-এর জন্য লিখুন। Benefits ও CTAs সহ।',
    stronger_hook: 'শুরুতে শক্তিশালী hook দিয়ে লিখুন।',
    use_input: 'Input অনুযায়ী সরাসরি লিখুন।',
  }

  const prompt = `তুমি BanglaAIHub-এর expert Bangla AI content writer।

টপিক: ${form.source_title}
মূল ধারণা: ${form.main_idea}
Content Type: ${form.content_type}
Style: ${styleMap[form.rewrite_style] || styleMap.expand_full_blog}
${form.tool_name ? `AI টুল: ${form.tool_name}` : ''}

নিয়ম:
- সম্পূর্ণ বাংলায় (technical terms ইংরেজিতে রাখো)
- HTML format: h2, h3, p, ul, li, strong tags
- Heading-এ id attribute দাও
- কমপক্ষে ${settings.min_word_count || 800} শব্দ

শুধু এই JSON দাও (backtick ছাড়া):
{"title":"বাংলা শিরোনাম","slug":"english-slug","excerpt_bn":"সারসংক্ষেপ","content_bn":"<h2 id='s1'>...</h2><p>...</p>","meta_title":"SEO title","meta_description":"SEO desc","tags":["tag1","tag2","tag3"]}`

  const text = await geminiGenerate(prompt, 4000)
  const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
  const parsed = JSON.parse(cleaned)
  return { ...parsed, word_count: parsed.content_bn.replace(/<[^>]*>/g, '').split(/\s+/).length }
}

async function generateFacebookHook(title: string, excerpt: string, hashtags: string[]): Promise<string> {
  const prompt = `BanglaAIHub Facebook page-এর জন্য viral hook post লিখো।

শিরোনাম: ${title}
সংক্ষেপ: ${excerpt.substring(0, 200)}

নিয়ম:
- চমকানো hook দিয়ে শুরু
- ৩-৪টি bullet point
- "পুরো গাইড পড়তে নিচের comment-এ link দেখুন 👇" দিয়ে শেষ
- সম্পূর্ণ বাংলায়, emoji সহ
- ২০০০ character-এর মধ্যে

শেষে hashtags: ${hashtags.slice(0, 5).join(' ')}

শুধু post text দাও।`

  return geminiGenerate(prompt, 800)
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const form = await req.json()
    const supabase = createAdminClient()

    const { data: settingsRows } = await supabase.from('site_settings').select('key, value')
    const settings: Record<string, any> = {}
    settingsRows?.forEach(r => { settings[r.key] = r.value })

    // Generate blog with Gemini
    const generated = await generateBlogContent(form, settings)

    // Unique slug
    let slug = slugify(generated.slug || generated.title)
    const { data: exists } = await supabase.from('blog_posts').select('id').eq('slug', slug).single()
    if (exists) slug = `${slug}-${Date.now()}`

    // Thumbnail
    let thumbnailUrl = form.thumbnail_url || null
    if (!thumbnailUrl && settings.unsplash_access_key) {
      thumbnailUrl = await fetchUnsplashThumbnail(form.tool_name || form.source_title, settings.unsplash_access_key)
    }

    // Save post
    const { data: post, error: postError } = await supabase.from('blog_posts').insert({
      title: generated.title, slug, content_type: form.content_type,
      excerpt_bn: generated.excerpt_bn, content_bn: generated.content_bn,
      thumbnail_url: thumbnailUrl,
      reading_time_minutes: estimateReadingTime(generated.content_bn),
      word_count: generated.word_count,
      meta_title: generated.meta_title, meta_description: generated.meta_description,
      tags: generated.tags || [], has_affiliate_links: true, affiliate_disclosure: true,
      source_platform: form.source_platform, source_url: form.source_url || null, source_title: form.source_title,
      status: form.publish_now ? 'published' : 'draft',
      published_at: form.publish_now ? new Date().toISOString() : null,
      scheduled_at: !form.publish_now && form.scheduled_at ? form.scheduled_at : null,
    }).select().single()

    if (postError) throw new Error(`Blog save failed: ${postError.message}`)

    await supabase.from('published_topics').insert({ title: generated.title, slug, keywords: generated.tags || [], blog_post_id: post.id })

    let fbPostId: string | null = null

    if (form.generate_facebook_post && settings.facebook_page_id && settings.facebook_access_token) {
      const siteUrl = settings.site_url || 'https://banglaAIhub.com'
      const blogUrl = `${siteUrl}/blog/${slug}`
      const hashtags = settings.default_facebook_hashtags || ['#BanglaAIHub', '#AITools']
      const hookText = await generateFacebookHook(generated.title, generated.excerpt_bn, hashtags)

      const { data: socialPost } = await supabase.from('social_posts').insert({
        blog_post_id: post.id, platform: 'facebook', hook_text: hookText,
        hashtags, full_post_text: hookText, blog_link: blogUrl,
        status: 'pending', scheduled_at: form.publish_now ? new Date().toISOString() : form.scheduled_at,
      }).select().single()

      if (form.publish_now) {
        fbPostId = await postToFacebook(settings.facebook_page_id, settings.facebook_access_token, hookText, thumbnailUrl || undefined)

        if (fbPostId) {
          await supabase.from('social_posts').update({ facebook_post_id: fbPostId, status: 'posted', posted_at: new Date().toISOString() }).eq('id', socialPost?.id)
          const delayMs = (parseInt(settings.facebook_comment_delay_minutes) || 5) * 60 * 1000
          setTimeout(async () => {
            try {
              const commentText = `📖 পুরো আর্টিকেল:\n${blogUrl}\n\n🔔 আরও AI টিপস পেতে BanglaAIHub follow করুন।`
              const cRes = await fetch(`https://graph.facebook.com/${fbPostId}/comments`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: commentText, access_token: settings.facebook_access_token }),
              })
              const cd = await cRes.json()
              if (cd.id) await supabase.from('social_posts').update({ facebook_comment_id: cd.id, comment_posted_at: new Date().toISOString() }).eq('id', socialPost?.id)
            } catch {}
          }, delayMs)
        } else {
          await supabase.from('social_posts').update({ status: 'failed', error_message: 'Facebook API failed' }).eq('id', socialPost?.id)
        }
      }
    }

    return NextResponse.json({ success: true, blog_id: post.id, blog_slug: slug, blog_title: generated.title, fb_post_id: fbPostId, word_count: generated.word_count })

  } catch (err: any) {
    console.error('Quick submit error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
