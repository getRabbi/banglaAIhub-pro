import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function retryFailedSocialPosts() {
  const { data: settings } = await supabase.from('site_settings').select('key, value')
  const s: Record<string, any> = {}
  settings?.forEach(r => { s[r.key] = r.value })

  if (!s.facebook_page_id || !s.facebook_access_token) {
    console.log('Facebook not configured')
    return
  }

  // Get failed posts (max 3 retries)
  const { data: failedPosts } = await supabase
    .from('social_posts')
    .select('*, blog_post:blog_posts(title, slug)')
    .eq('status', 'failed')
    .lt('retry_count', 3)
    .order('created_at')
    .limit(10)

  if (!failedPosts || failedPosts.length === 0) {
    console.log('No failed posts to retry')
    return
  }

  console.log(`Retrying ${failedPosts.length} failed posts...`)

  for (const post of failedPosts) {
    try {
      const res = await fetch(`https://graph.facebook.com/${s.facebook_page_id}/feed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: post.full_post_text || post.hook_text,
          access_token: s.facebook_access_token,
        }),
      })
      const data = await res.json()

      if (data.id) {
        await supabase.from('social_posts').update({
          facebook_post_id: data.id,
          status: 'posted',
          posted_at: new Date().toISOString(),
          retry_count: (post.retry_count || 0) + 1,
          error_message: null,
        }).eq('id', post.id)

        console.log(`✓ Retried successfully: ${post.id}`)

        // Post comment after delay
        const delayMs = (parseInt(s.facebook_comment_delay_minutes) || 5) * 60 * 1000
        await new Promise(r => setTimeout(r, Math.min(delayMs, 10000)))

        if (post.blog_link) {
          const commentRes = await fetch(`https://graph.facebook.com/${data.id}/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              message: `📖 পুরো আর্টিকেল:\n${post.blog_link}`,
              access_token: s.facebook_access_token,
            }),
          })
          const commentData = await commentRes.json()
          if (commentData.id) {
            await supabase.from('social_posts').update({
              facebook_comment_id: commentData.id,
              comment_posted_at: new Date().toISOString(),
            }).eq('id', post.id)
          }
        }
      } else {
        await supabase.from('social_posts').update({
          retry_count: (post.retry_count || 0) + 1,
          error_message: JSON.stringify(data.error || 'Unknown error'),
        }).eq('id', post.id)
        console.log(`✗ Retry failed: ${post.id}`)
      }
    } catch (e: any) {
      await supabase.from('social_posts').update({
        retry_count: (post.retry_count || 0) + 1,
        error_message: e.message,
      }).eq('id', post.id)
    }

    await new Promise(r => setTimeout(r, 2000))
  }
}

retryFailedSocialPosts().catch(console.error)
