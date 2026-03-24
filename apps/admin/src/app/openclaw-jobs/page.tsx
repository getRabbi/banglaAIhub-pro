'use client'
import AdminLayout from '@/components/layout/AdminLayout'
import { useEffect, useState } from 'react'
import { Bot, RefreshCw, Loader2, ChevronDown, ChevronUp, Play } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'

export default function OpenClawJobsPage() {
  const [jobs, setJobs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedJob, setExpandedJob] = useState<string | null>(null)
  const [logs, setLogs] = useState<Record<string, any[]>>({})
  const [triggering, setTriggering] = useState(false)
  const supabase = createClient()

  const load = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('openclaw_jobs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20)
    setJobs(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const loadLogs = async (jobId: string) => {
    if (logs[jobId]) { setExpandedJob(expandedJob === jobId ? null : jobId); return }
    const { data } = await supabase
      .from('openclaw_job_logs')
      .select('*')
      .eq('job_id', jobId)
      .order('logged_at')
    setLogs(l => ({ ...l, [jobId]: data || [] }))
    setExpandedJob(jobId)
  }

  const triggerManual = async () => {
    setTriggering(true)
    try {
      const res = await fetch('/api/openclaw/trigger', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('OpenClaw manually triggered!')
      setTimeout(load, 2000)
    } catch (e: any) {
      toast.error(e.message)
    } finally {
      setTriggering(false)
    }
  }

  const retryJob = async (jobId: string) => {
    try {
      const res = await fetch('/api/openclaw/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ job_id: jobId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
      toast.success('Job retry triggered!')
      load()
    } catch (e: any) {
      toast.error(e.message)
    }
  }

  const statusColor: Record<string, string> = {
    completed: 'status-badge-published',
    running: 'status-badge-running',
    failed: 'status-badge-failed',
    pending: 'status-badge-pending',
    cancelled: 'status-badge-draft',
  }

  const logColor: Record<string, string> = {
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <Bot className="w-5 h-5 text-purple-400" /> OpenClaw Jobs
            </h1>
            <p className="text-sm text-gray-400 mt-0.5">Automation job history ও status monitor</p>
          </div>
          <div className="flex gap-2">
            <button onClick={load} className="admin-btn-secondary">
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button onClick={triggerManual} disabled={triggering} className="admin-btn-primary">
              {triggering ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              Manual Trigger
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-blue-400" />
          </div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 text-gray-500">কোনো job নেই</div>
        ) : (
          <div className="space-y-3">
            {jobs.map(job => (
              <div key={job.id} className="admin-card overflow-hidden">
                <div className="p-4 flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={statusColor[job.status] || 'status-badge-pending'}>
                        {job.status === 'completed' ? '✓ সম্পন্ন' :
                         job.status === 'running' ? '⟳ চলছে' :
                         job.status === 'failed' ? '✗ ব্যর্থ' :
                         job.status === 'pending' ? '○ অপেক্ষায়' : job.status}
                      </span>
                      <span className="text-xs text-gray-500 capitalize">{job.trigger_type}</span>
                    </div>
                    <div className="text-sm text-white font-medium">{job.job_name}</div>
                    <div className="flex gap-4 mt-1 text-xs text-gray-500">
                      <span>Scraped: {job.total_scraped}</span>
                      <span className="text-green-400">Published: {job.total_published}/{job.posts_target}</span>
                      {job.total_failed > 0 && <span className="text-red-400">Failed: {job.total_failed}</span>}
                      <span>{new Date(job.created_at).toLocaleString('bn-BD')}</span>
                      {job.completed_at && (
                        <span>Duration: {Math.round((new Date(job.completed_at).getTime() - new Date(job.started_at || job.created_at).getTime()) / 1000)}s</span>
                      )}
                    </div>
                    {job.error_message && (
                      <p className="text-xs text-red-400 mt-1">{job.error_message}</p>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {job.status === 'failed' && (
                      <button onClick={() => retryJob(job.id)} className="admin-btn-secondary text-xs py-1.5">
                        Retry
                      </button>
                    )}
                    <button onClick={() => loadLogs(job.id)}
                      className="p-2 rounded-lg text-gray-400 hover:bg-gray-800 transition-colors"
                    >
                      {expandedJob === job.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {expandedJob === job.id && logs[job.id] && (
                  <div className="border-t border-gray-800 bg-gray-950 p-4">
                    <div className="font-mono text-xs space-y-1 max-h-64 overflow-y-auto">
                      {logs[job.id].length === 0
                        ? <span className="text-gray-600">কোনো log নেই</span>
                        : logs[job.id].map(log => (
                          <div key={log.id} className="flex gap-3">
                            <span className="text-gray-600 shrink-0">
                              {new Date(log.logged_at).toLocaleTimeString()}
                            </span>
                            <span className={`shrink-0 w-16 ${logColor[log.status] || 'text-gray-400'}`}>
                              [{log.status}]
                            </span>
                            <span className="text-gray-300">{log.step}: {log.message}</span>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
