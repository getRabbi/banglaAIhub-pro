import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const title = searchParams.get('title') || 'BanglaAIHub'
  const type = searchParams.get('type') || 'blog'
  const category = searchParams.get('category') || ''

  const typeColors: Record<string, string> = {
    blog: '#3b82f6',
    tool_review: '#8b5cf6',
    comparison: '#f59e0b',
    top_list: '#10b981',
    guide: '#06b6d4',
    money_making: '#22c55e',
  }
  const accent = typeColors[type] || '#3b82f6'

  return new ImageResponse(
    (
      <div style={{
        width: '1200px', height: '630px',
        background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'flex-start', justifyContent: 'center',
        padding: '60px 80px', fontFamily: 'sans-serif',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Background accent */}
        <div style={{
          position: 'absolute', top: '-100px', right: '-100px',
          width: '400px', height: '400px',
          borderRadius: '50%', background: accent, opacity: 0.1,
        }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: `linear-gradient(135deg, ${accent}, #8b5cf6)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px',
          }}>⚡</div>
          <span style={{ fontSize: '28px', fontWeight: 'bold', color: 'white' }}>BanglaAIHub</span>
        </div>

        {/* Category badge */}
        {category && (
          <div style={{
            background: `${accent}20`, border: `1px solid ${accent}50`,
            borderRadius: '999px', padding: '6px 16px', marginBottom: '20px',
            fontSize: '16px', color: accent, fontWeight: '600',
          }}>
            {category}
          </div>
        )}

        {/* Title */}
        <div style={{
          fontSize: title.length > 60 ? '40px' : '52px',
          fontWeight: 'bold', color: 'white',
          lineHeight: '1.2', maxWidth: '900px', marginBottom: '30px',
        }}>
          {title.length > 80 ? title.substring(0, 80) + '...' : title}
        </div>

        {/* Footer */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            background: accent, borderRadius: '8px',
            padding: '6px 16px', fontSize: '14px', color: 'white', fontWeight: '600',
          }}>
            {type === 'tool_review' ? 'টুল রিভিউ' :
             type === 'comparison' ? 'তুলনা' :
             type === 'top_list' ? 'টপ লিস্ট' :
             type === 'guide' ? 'গাইড' :
             type === 'money_making' ? 'আয় করুন' : 'ব্লগ'}
          </div>
          <span style={{ color: '#64748b', fontSize: '16px' }}>banglaAIhub.com</span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 }
  )
}
