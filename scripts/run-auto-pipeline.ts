#!/usr/bin/env node
/**
 * OpenClaw Auto Pipeline — Gemini Edition
 * Scrape → Score → Translate → Publish → Facebook
 */

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// ─── Gemini API ───────────────────────────────────────────────────────────────

async function geminiGenerate(prompt: string, maxTokens = 4000): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) throw new Error('GEMINI_API_KEY not set')

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: maxTokens, temperature: 0.7 },
      }),
    }
  )
  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Gemini error ${res.status}: ${err}`)
  }
  const data = await res.json()
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text
  if (!text) throw new Error('Gemini returned empty response')
  return text.trim()
}

// ─── Settings ─────────────────────────────────────────────────────────────────

async function loadSettings(): Promise<Record<string, any>> {
  const { data } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, any> = {}
  data?.forEach(r => { s[r.key] = r.value })
  return s
}

// ─── Logger ───────────────────────────────────────────────────────────────────

async function log(jobId: string, step: string, status: 'info' | 'success' | 'error' | 'warning', message: string) {
  console.log(`[${status.toUpperCase()}] ${step}: ${message}`)
  await supabase.from('openclaw_job_logs').insert({ job_id: jobId, step, status, message })
}

// ─── Duplicate Check ──────────────────────────────────────────────────────────

async function isDuplicate(title: string): Promise<boolean> {
  const keywords = title.toLowerCase().split(/\s+/).filter(w => w.length > 3).slice(0, 5)
  if (keywords.length === 0) return false
  const { data } = await supabase.from('published_topics')
    .select('title')
    .gte('published_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
    .limit(100)
  if (!data) return false
  return data.some(topic => {
    const topicWords = topic.title.toLowerCase().split(/\s+/)
    const matches = keywords.filter(kw => topicWords.some((tw: string) => tw.includes(kw) || kw.includes(tw)))
    return matches.length >= 3
  })
}

// ─── Scrapers ─────────────────────────────────────────────────────────────────

async function scrapeReddit(): Promise<any[]> {
  const SUBS = ['artificial', 'ChatGPT', 'AItools', 'OpenAI', 'MachineLearning']
  const items: any[] = []
  for (const sub of SUBS.slice(0, 3)) {
    try {
      const res = await fetch(`https://www.reddit.com/r/${sub}/hot.json?limit=10`, {
        headers: { 'User-Agent': 'BanglaAIHub/1.0' }
      })
      if (!res.ok) continue
      const data = await res.json()
      for (const p of data?.data?.children || []) {
        const d = p.data
        if (d.score < 100 || d.stickied) continue
        items.push({
          source_platform: 'reddit',
          source_url: `https://reddit.com${d.permalink}`,
          source_title: d.title,
          source_content: d.selftext?.substring(0, 500) || '',
          source_score: d.score,
          source_engagement: { upvotes: d.score, comments: d.num_comments },
        })
      }
      await new Promise(r => setTimeout(r, 1200))
    } catch (e) { console.error(`Reddit r/${sub}:`, e) }
  }
  return items
}

async function scrapeHackerNews(): Promise<any[]> {
  try {
    const res = await fetch('https://hn.algolia.com/api/v1/search?tags=story&query=AI+tools&hitsPerPage=15&numericFilters=points>50')
    const data = await res.json()
    return (data.hits || []).map((hit: any) => ({
      source_platform: 'hackernews',
      source_url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
      source_title: hit.title,
      source_content: hit.story_text?.substring(0, 500) || '',
      source_score: hit.points,
      source_engagement: { points: hit.points, comments: hit.num_comments },
    }))
  } catch { return [] }
}

async function scrapeProductHunt(): Promise<any[]> {
  try {
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const dateStr = yesterday.toISOString().split('T')[0]
    const res = await fetch('https://api.producthunt.com/v2/api/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PRODUCTHUNT_TOKEN || ''}`,
      },
      body: JSON.stringify({
        query: `{ posts(postedBefore:"${dateStr}T23:59:59Z",postedAfter:"${dateStr}T00:00:00Z",first:10) { edges { node { name tagline votesCount url } } } }`
      }),
    })
    if (!res.ok) return []
    const data = await res.json()
    return (data?.data?.posts?.edges || []).map((e: any) => ({
      source_platform: 'producthunt',
      source_url: e.node.url,
      source_title: `${e.node.name}: ${e.node.tagline}`,
      source_content: e.node.tagline,
      source_score: e.node.votesCount,
      source_engagement: { votes: e.node.votesCount },
    }))
  } catch { return [] }
}

// ─── Scoring ──────────────────────────────────────────────────────────────────

function scoreRelevance(item: any, blacklist: string[]): number {
  const text = `${item.source_title} ${item.source_content}`.toLowerCase()
  if (blacklist.some(kw => text.includes(kw.toLowerCase()))) return 0
  const AI_KW = ['ai', 'artificial intelligence', 'chatgpt', 'gpt', 'claude', 'gemini', 'llm',
    'machine learning', 'automation', 'tool', 'productivity', 'freelance', 'income', 'saas']
  const matches = AI_KW.filter(kw => text.includes(kw))
  return Math.min(matches.length * 10 + Math.min(item.source_score / 10, 30), 100)
}

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '').substring(0, 80)
}

// ─── Content Generation ───────────────────────────────────────────────────────

async function generateBlogPost(item: any, settings: Record<string, any>): Promise<any> {
  const prompt = `তুমি BanglaAIHub-এর expert Bangla AI content writer।

সোর্স শিরোনাম: ${item.source_title}
সোর্স: ${item.source_platform}
${item.source_content ? `Content: ${item.source_content.substring(0, 300)}` : ''}

বাংলায় পূর্ণ blog post লিখো।
- সম্পূর্ণ বাংলায় (technical terms ইংরেজিতে রাখো)
- কমপক্ষে ${settings.min_word_count || 800} শব্দ
- HTML format: h2, h3, p, ul, li, strong
- Heading-এ id attribute
- Bangladesh-এর পাঠকদের জন্য relevant ও actionable

শুধু এই JSON দাও (backtick ছাড়া):
{"title":"আকর্ষণীয় বাংলা শিরোনাম","slug":"english-slug","excerpt_bn":"সারসংক্ষেপ","content_bn":"<h2 id='s1'>...</h2><p>...</p>","meta_title":"SEO title","meta_description":"SEO desc","tags":["tag1","tag2","tag3"]}`

  const text = await geminiGenerate(prompt, 4000)
  return JSON.parse(text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim())
}

async function generateFacebookHook(title: string, excerpt: string, hashtags: string[]): Promise<string> {
  const prompt = `Facebook viral hook post লিখো BanglaAIHub page-এর জন্য।
শিরোনাম: ${title}
সারসংক্ষেপ: ${excerpt.substring(0, 200)}
- চমকানো hook দিয়ে শুরু
- ৩-৫টি bullet point
- "পুরোটা নিচের comment-এ 👇" দিয়ে শেষ
- সম্পূর্ণ বাংলায়, emoji সহ
শেষে hashtags: ${hashtags.slice(0, 5).join(' ')}
শুধু post text দাও।`
  return geminiGenerate(prompt, 600)
}

// ─── Facebook ─────────────────────────────────────────────────────────────────

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

// ─── Main Pipeline ────────────────────────────────────────────────────────────

async function runPipeline() {
  const settings = await loadSettings()

  if (!settings.openclaw_enabled) {
    console.log('OpenClaw disabled. Exiting.')
    return
  }

  const postsTarget = parseInt(settings.daily_post_count) || 3

  const { data: job } = await supabase.from('openclaw_jobs').insert({
    job_name: `Auto Pipeline — ${new Date().toLocaleDateString('bn-BD')}`,
    trigger_type: 'scheduled',
    status: 'running',
    posts_target: postsTarget,
    started_at: new Date().toISOString(),
  }).select().single()

  if (!job) { console.error('Failed to create job'); return }
  const jobId = job.id
  let published = 0, failed = 0

  await log(jobId, 'init', 'info', `Pipeline started — Gemini — target: ${postsTarget} posts`)

  try {
    // Scrape
    await log(jobId, 'scraping', 'info', 'Collecting from sources...')
    const [redditItems, hnItems, phItems] = await Promise.all([
      scrapeReddit(), scrapeHackerNews(), scrapeProductHunt()
    ])
    const allItems = [...redditItems, ...hnItems, ...phItems]
    await log(jobId, 'scraping', 'success', `${allItems.length} items collected`)

    // Score & filter
    const blacklist = settings.keyword_blacklist || []
    const scored = allItems
      .map(item => ({ ...item, relevance_score: scoreRelevance(item, blacklist) }))
      .filter(item => item.relevance_score > 20)
      .sort((a, b) => b.relevance_score - a.relevance_score)

    await log(jobId, 'scoring', 'info', `${scored.length} relevant items`)

    // Dedup & save to queue
    const candidates = []
    for (const item of scored.slice(0, 20)) {
      const dup = await isDuplicate(item.source_title)
      const { data: saved } = await supabase.from('scrape_queue').insert({
        ...item,
        is_duplicate: dup,
        status: dup ? 'rejected' : 'approved',
        rejection_reason: dup ? 'Duplicate topic' : null,
      }).select().single()
      if (!dup && saved) candidates.push({ ...item, queue_id: saved.id })
      if (candidates.length >= postsTarget * 2) break
    }

    await supabase.from('openclaw_jobs').update({ total_scraped: allItems.length }).eq('id', jobId)
    await log(jobId, 'dedup', 'info', `${candidates.length} unique candidates`)

    // Generate & publish
    for (const item of candidates.slice(0, postsTarget)) {
      if (published >= postsTarget) break
      try {
        await log(jobId, 'generate', 'info', `Generating: ${item.source_title.substring(0, 60)}...`)

        const generated = await generateBlogPost(item, settings)

        let slug = slugify(generated.slug || generated.title)
        const { data: exists } = await supabase.from('blog_posts').select('id').eq('slug', slug).single()
        if (exists) slug = `${slug}-${Date.now()}`

        // Thumbnail
        let thumbnailUrl = null
        if (settings.unsplash_access_key) {
          try {
            const res = await fetch(
              `https://api.unsplash.com/search/photos?query=${encodeURIComponent(item.source_title + ' technology')}&per_page=1&orientation=landscape`,
              { headers: { Authorization: `Client-ID ${settings.unsplash_access_key}` } }
            )
            const data = await res.json()
            thumbnailUrl = data.results?.[0]?.urls?.regular || null
          } catch {}
        }

        const wordCount = generated.content_bn.replace(/<[^>]*>/g, '').split(/\s+/).length

        const { data: post, error: postErr } = await supabase.from('blog_posts').insert({
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

        if (postErr || !post) throw new Error(`Blog save: ${postErr?.message}`)

        await supabase.from('published_topics').insert({ title: generated.title, slug, keywords: generated.tags || [], blog_post_id: post.id })
        await supabase.from('scrape_queue').update({ status: 'published', generated_blog_id: post.id, published_at: new Date().toISOString() }).eq('id', item.queue_id)

        await log(jobId, 'publish', 'success', `Published: ${generated.title}`)

        // Facebook
        if (settings.facebook_page_id && settings.facebook_access_token) {
          const siteUrl = settings.site_url || 'https://banglaAIhub.com'
          const blogUrl = `${siteUrl}/blog/${slug}`
          const hashtags = settings.default_facebook_hashtags || ['#BanglaAIHub', '#AITools']
          const hookText = await generateFacebookHook(generated.title, generated.excerpt_bn, hashtags)

          const { data: socialPost } = await supabase.from('social_posts').insert({
            blog_post_id: post.id, platform: 'facebook',
            hook_text: hookText, hashtags, full_post_text: hookText,
            blog_link: blogUrl, status: 'pending',
          }).select().single()

          const fbPostId = await postToFacebook(settings.facebook_page_id, settings.facebook_access_token, hookText, thumbnailUrl || undefined)

          if (fbPostId) {
            await supabase.from('social_posts').update({ facebook_post_id: fbPostId, status: 'posted', posted_at: new Date().toISOString() }).eq('id', socialPost?.id)
            await log(jobId, 'facebook', 'success', `FB posted: ${fbPostId}`)

            const delayMs = (parseInt(settings.facebook_comment_delay_minutes) || 5) * 60 * 1000
            setTimeout(async () => {
              try {
                const commentMsg = `📖 পুরো আর্টিকেল পড়ুন:\n${blogUrl}\n\n🔔 আরও AI tips পেতে BanglaAIHub follow করুন।`
                const cRes = await fetch(`https://graph.facebook.com/${fbPostId}/comments`, {
                  method: 'POST', headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ message: commentMsg, access_token: settings.facebook_access_token }),
                })
                const cd = await cRes.json()
                if (cd.id) await supabase.from('social_posts').update({ facebook_comment_id: cd.id, comment_posted_at: new Date().toISOString() }).eq('id', socialPost?.id)
              } catch {}
            }, delayMs)
          } else {
            await supabase.from('social_posts').update({ status: 'failed', error_message: 'FB API failed' }).eq('id', socialPost?.id)
            await log(jobId, 'facebook', 'warning', 'Facebook post failed')
          }
        }

        published++
        await supabase.from('openclaw_jobs').update({ total_published: published }).eq('id', jobId)
        await new Promise(r => setTimeout(r, 3000))

      } catch (err: any) {
        failed++
        await supabase.from('openclaw_jobs').update({ total_failed: failed }).eq('id', jobId)
        await log(jobId, 'generate', 'error', err.message)
      }
    }

    await supabase.from('openclaw_jobs').update({ status: 'completed', total_published: published, total_failed: failed, completed_at: new Date().toISOString() }).eq('id', jobId)
    await log(jobId, 'done', 'success', `Complete: ${published} published, ${failed} failed`)

  } catch (err: any) {
    await supabase.from('openclaw_jobs').update({ status: 'failed', error_message: err.message, completed_at: new Date().toISOString() }).eq('id', jobId)
    await log(jobId, 'pipeline', 'error', `Pipeline failed: ${err.message}`)
  }
}

runPipeline().catch(console.error)
