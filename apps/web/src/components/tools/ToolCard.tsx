'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Star, ExternalLink } from 'lucide-react'
import type { Tool } from '@/types'

interface ToolCardProps {
  tool: Tool
  showCategory?: boolean
  compact?: boolean
}

const PRICING_BADGE: Record<string, { label: string; className: string }> = {
  free: { label: 'ফ্রি', className: 'badge-free' },
  freemium: { label: 'ফ্রিমিয়াম', className: 'badge-freemium' },
  paid: { label: 'পেইড', className: 'badge-paid' },
  open_source: { label: 'ওপেন সোর্স', className: 'badge-free' },
}

export default function ToolCard({ tool, showCategory = true, compact = false }: ToolCardProps) {
  const pricing = PRICING_BADGE[tool.pricing_type]

  return (
    <div className="card-hover group p-4 flex flex-col gap-3 relative">
      {/* Badges */}
      <div className="absolute top-3 right-3 flex flex-col gap-1 items-end">
        {tool.is_editors_choice && (
          <span className="badge-editors text-xs">⭐ এডিটর চয়েস</span>
        )}
        {tool.is_new && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-full">নতুন</span>
        )}
        {tool.is_trending && (
          <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">🔥 ট্রেন্ডিং</span>
        )}
      </div>

      {/* Header */}
      <div className="flex items-start gap-3">
        <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden shrink-0">
          {tool.logo_url ? (
            <Image src={tool.logo_url} alt={tool.name} width={48} height={48} className="object-cover" />
          ) : (
            <span className="text-xl">🤖</span>
          )}
        </div>
        <div className="flex-1 min-w-0 pr-16">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-blue-600 transition-colors">
            {tool.name}
          </h3>
          {showCategory && tool.category && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {tool.category.icon} {tool.category.name_bn}
            </span>
          )}
        </div>
      </div>

      {/* Tagline */}
      {tool.tagline_bn && (
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
          {tool.tagline_bn}
        </p>
      )}

      {/* Rating + Pricing */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="flex">
            {[1,2,3,4,5].map((i) => (
              <Star key={i}
                className={`w-3.5 h-3.5 ${i <= Math.round(tool.overall_rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300 dark:text-gray-600'}`}
              />
            ))}
          </div>
          <span className="text-xs text-gray-500">({tool.overall_rating.toFixed(1)})</span>
        </div>
        <span className={pricing.className}>{pricing.label}</span>
      </div>

      {/* Best for tags */}
      {!compact && tool.best_for?.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tool.best_for.slice(0, 2).map((tag: string) => (
            <span key={tag} className="px-2 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 mt-auto pt-1">
        <Link href={`/tools/${tool.slug}`}
          className="flex-1 btn-secondary text-sm py-2 justify-center"
        >
          বিস্তারিত
        </Link>
        {tool.affiliate_link ? (
          <Link href={`/go/${tool.affiliate_link.slug}`}
            target="_blank"
            className="flex-1 btn-accent text-sm py-2 justify-center"
          >
            দেখুন <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        ) : tool.website_url ? (
          <a href={tool.website_url} target="_blank" rel="noopener noreferrer"
            className="flex-1 btn-accent text-sm py-2 justify-center inline-flex items-center gap-1"
          >
            দেখুন <ExternalLink className="w-3.5 h-3.5" />
          </a>
        ) : null}
      </div>


    </div>
  )
}
