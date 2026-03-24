import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

async function checkAffiliateLinks() {
  console.log('Checking affiliate links...')
  const { data: links } = await supabase
    .from('affiliate_links')
    .select('id, slug, destination_url, tool_name')
    .eq('is_active', true)

  if (!links) return

  let broken = 0
  for (const link of links) {
    try {
      const res = await fetch(link.destination_url, {
        method: 'HEAD',
        redirect: 'follow',
        signal: AbortSignal.timeout(10000),
      })
      if (res.status >= 400) {
        console.log(`❌ Broken: ${link.tool_name} — ${link.destination_url} (${res.status})`)
        broken++
      } else {
        console.log(`✓ OK: ${link.tool_name}`)
      }
    } catch (e: any) {
      console.log(`❌ Error: ${link.tool_name} — ${e.message}`)
      broken++
    }
    await new Promise(r => setTimeout(r, 1000))
  }

  console.log(`\nDone. ${broken} broken out of ${links.length} links.`)
}

checkAffiliateLinks().catch(console.error)
