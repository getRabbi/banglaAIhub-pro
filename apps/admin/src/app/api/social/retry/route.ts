import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { social_post_id } = await req.json()
    const supabase = createAdminClient()

    const { data: post } = await supabase.from('social_posts').select('*').eq('id', social_post_id).single()
    if (!post) return NextResponse.json({ error: 'Post not found' }, { status: 404 })

    const { data: settingsRows } = await supabase.from('site_settings').select('key, value')
    const settings: Record<string, any> = {}
    settingsRows?.forEach(r => { settings[r.key] = r.value })

    if (!settings.facebook_page_id || !settings.facebook_access_token) {
      return NextResponse.json({ error: 'Facebook not configured' }, { status: 400 })
    }

    const res = await fetch(`https://graph.facebook.com/${settings.facebook_page_id}/feed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: post.full_post_text || post.hook_text, access_token: settings.facebook_access_token }),
    })
    const data = await res.json()

    if (data.id) {
      await supabase.from('social_posts').update({
        facebook_post_id: data.id,
        status: 'posted',
        posted_at: new Date().toISOString(),
        retry_count: (post.retry_count || 0) + 1,
        error_message: null,
      }).eq('id', social_post_id)

      // Comment after delay
      const delayMs = (parseInt(settings.facebook_comment_delay_minutes) || 5) * 60 * 1000
      if (post.blog_link) {
        setTimeout(async () => {
          try {
            const commentRes = await fetch(`https://graph.facebook.com/${data.id}/comments`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: `📖 পুরো আর্টিকেল:\n${post.blog_link}`, access_token: settings.facebook_access_token }),
            })
            const cd = await commentRes.json()
            if (cd.id) {
              await supabase.from('social_posts').update({ facebook_comment_id: cd.id, comment_posted_at: new Date().toISOString() }).eq('id', social_post_id)
            }
          } catch {}
        }, delayMs)
      }

      return NextResponse.json({ success: true, facebook_post_id: data.id })
    } else {
      await supabase.from('social_posts').update({
        retry_count: (post.retry_count || 0) + 1,
        error_message: JSON.stringify(data.error),
      }).eq('id', social_post_id)
      return NextResponse.json({ error: 'Facebook post failed', details: data.error }, { status: 500 })
    }
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
