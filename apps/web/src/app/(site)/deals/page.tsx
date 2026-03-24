import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { Tag, ExternalLink, Clock } from 'lucide-react'
import CopyButton from '@/components/ui/CopyButton'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI টুলস ডিলস ও অফার - BanglaAIHub',
  description: 'সেরা AI টুলসের ডিসকাউন্ট, কুপন কোড, লাইফটাইম ডিল ও ফ্রি ট্রায়াল।',
}
export const revalidate = 1800

export default async function DealsPage() {
  const supabase = createClient()
  const { data: deals } = await supabase.from('deals')
    .select('*, tool:tools(name, logo_url, slug)')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  const DEAL_TYPE_LABELS: Record<string, { label: string; color: string }> = {
    lifetime: { label: '🔥 লাইফটাইম ডিল', color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400' },
    discount: { label: '💰 ডিসকাউন্ট', color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' },
    coupon: { label: '🎫 কুপন', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400' },
    free_trial: { label: '✅ ফ্রি ট্রায়াল', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400' },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <Tag className="w-5 h-5 text-red-500" />
          <span className="text-sm font-medium text-red-500">সীমিত সময়</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI টুলস ডিলস ও অফার</h1>
        <p className="text-gray-500 dark:text-gray-400">সেরা AI টুলসে সর্বোচ্চ ছাড় ও অফার — নিয়মিত আপডেট হয়</p>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2 mb-8">
        {Object.entries(DEAL_TYPE_LABELS).map(([type, { label }]) => (
          <span key={type} className="px-3 py-1.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full text-sm cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            {label}
          </span>
        ))}
      </div>

      {deals && deals.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {deals.map((deal: any) => {
            const typeInfo = DEAL_TYPE_LABELS[deal.deal_type] || { label: deal.deal_type, color: 'bg-gray-100 text-gray-600' }
            const isExpired = deal.expires_at && new Date(deal.expires_at) < new Date()
            return (
              <div key={deal.id} className={`card-hover p-5 flex flex-col gap-4 ${isExpired ? 'opacity-60' : ''}`}>
                {/* Header */}
                <div className="flex items-center gap-3">
                  {deal.tool?.logo_url && (
                    <Image src={deal.tool.logo_url} alt={deal.tool_name || ''} width={40} height={40} className="rounded-xl" />
                  )}
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900 dark:text-white">{deal.tool_name}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${typeInfo.color}`}>{typeInfo.label}</span>
                  </div>
                  {deal.is_featured && <span className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 px-2 py-0.5 rounded-full">Featured</span>}
                </div>

                {/* Description */}
                {deal.description_bn && <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{deal.description_bn}</p>}

                {/* Discount */}
                {deal.discount_percent && (
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-green-600">{deal.discount_percent}% OFF</span>
                    {deal.original_price_usd && deal.deal_price_usd && (
                      <div className="text-sm">
                        <span className="line-through text-gray-400">${deal.original_price_usd}</span>
                        <span className="text-green-600 font-semibold ml-1">${deal.deal_price_usd}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Coupon code */}
                {deal.coupon_code && (
                  <div className="flex items-center gap-2">
                    <code className="flex-1 text-center font-mono text-sm bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 select-all">
                      {deal.coupon_code}
                    </code>
                    <CopyButton code={deal.coupon_code} />
                  </div>
                )}

                {/* Expiry */}
                {deal.expires_at && (
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5" />
                    {isExpired ? 'মেয়াদ শেষ' : `মেয়াদ: ${new Date(deal.expires_at).toLocaleDateString('bn-BD')}`}
                  </div>
                )}

                {/* CTA */}
                {deal.affiliate_url && !isExpired && (
                  <a href={deal.affiliate_url} target="_blank" rel="noopener noreferrer"
                    className="btn-accent w-full justify-center text-sm">
                    অফার নিন <ExternalLink className="w-4 h-4" />
                  </a>
                )}
                {isExpired && (
                  <div className="text-center text-sm text-gray-400 py-2">এই অফারের মেয়াদ শেষ হয়ে গেছে</div>
                )}
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-20">
          <Tag className="w-12 h-12 text-gray-200 dark:text-gray-700 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">এখনো কোনো ডিল নেই</h2>
          <p className="text-gray-500">শীঘ্রই আসছে — newsletter সাবস্ক্রাইব করুন সবার আগে জানতে</p>
          <Link href="/newsletter" className="btn-primary mt-4 inline-flex">নিউজলেটার সাবস্ক্রাইব করুন</Link>
        </div>
      )}
    </div>
  )
}
