import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const supabase = createClient()

  const { data: link } = await supabase
    .from('affiliate_links')
    .select('id, destination_url, click_count, is_active')
    .eq('slug', params.slug)
    .single()

  if (!link || !link.is_active) {
    redirect('/')
  }

  // Track click (fire and forget)
  const ua = req.headers.get('user-agent') || ''
  const referer = req.headers.get('referer') || ''
  const ip = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || ''
  const ipHash = Buffer.from(ip).toString('base64').slice(0, 16)

  supabase.from('affiliate_clicks').insert({
    affiliate_link_id: link.id,
    referrer_url: referer,
    user_agent: ua,
    ip_hash: ipHash,
  })
  supabase.from('affiliate_links').update({ click_count: link.click_count + 1 }).eq('id', link.id)

  redirect(link.destination_url)
}
