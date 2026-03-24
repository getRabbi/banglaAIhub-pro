import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { job_id } = await req.json()
    const supabase = createAdminClient()

    // Reset failed job back to pending so next pipeline run picks it up
    const { error } = await supabase
      .from('openclaw_jobs')
      .update({
        status: 'pending',
        error_message: null,
        started_at: null,
        completed_at: null,
      })
      .eq('id', job_id)
      .eq('status', 'failed')

    if (error) throw error

    await supabase.from('openclaw_job_logs').insert({
      job_id,
      step: 'retry',
      status: 'info',
      message: 'Job manually reset to pending for retry',
    })

    return NextResponse.json({ success: true, message: 'Job queued for retry' })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
