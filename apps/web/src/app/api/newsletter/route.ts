import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const { email, name } = await req.json()
    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'ভুল ইমেইল' }, { status: 400 })
    }
    const supabase = createClient()
    const { error } = await supabase.from('newsletter_subscribers').upsert(
      { email, name: name || null, is_active: true, source: 'website' },
      { onConflict: 'email' }
    )
    if (error) throw error
    return NextResponse.json({ message: 'সাবস্ক্রাইব সফল হয়েছে!' })
  } catch {
    return NextResponse.json({ error: 'সাবস্ক্রাইব ব্যর্থ হয়েছে' }, { status: 500 })
  }
}
