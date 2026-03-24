import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const supabase = createAdminClient()

    // Check if pipeline is already running
    const { data: running } = await supabase
      .from('openclaw_jobs')
      .select('id')
      .eq('status', 'running')
      .single()

    if (running) {
      return NextResponse.json({ error: 'Pipeline is already running' }, { status: 409 })
    }

    // Trigger GitHub Actions via repository dispatch
    // OR run inline (for Vercel deployment use GitHub Actions)
    const githubToken = process.env.GITHUB_TOKEN
    const githubRepo = process.env.GITHUB_REPO // e.g. "yourusername/banglaAIhub"

    if (githubToken && githubRepo) {
      const res = await fetch(`https://api.github.com/repos/${githubRepo}/dispatches`, {
        method: 'POST',
        headers: {
          Authorization: `token ${githubToken}`,
          'Content-Type': 'application/json',
          Accept: 'application/vnd.github.v3+json',
        },
        body: JSON.stringify({ event_type: 'manual-openclaw-trigger' }),
      })

      if (!res.ok) {
        const err = await res.text()
        throw new Error(`GitHub dispatch failed: ${err}`)
      }

      return NextResponse.json({ success: true, message: 'Pipeline triggered via GitHub Actions' })
    }

    // Fallback: Create a pending job record (will be picked up next scheduled run)
    const { data: job } = await supabase.from('openclaw_jobs').insert({
      job_name: `Manual Trigger — ${new Date().toLocaleString('bn-BD')}`,
      trigger_type: 'manual',
      status: 'pending',
      posts_target: 3,
    }).select().single()

    return NextResponse.json({ success: true, job_id: job?.id, message: 'Job queued' })

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
