import Link from 'next/link'
import { TrendingUp, Sparkles, ArrowRight } from 'lucide-react'
import ToolCard from '@/components/tools/ToolCard'
import type { Tool } from '@/types'

interface Props {
  tools: Tool[]
  newTools: Tool[]
}

export default function TrendingTools({ tools, newTools }: Props) {
  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4">
        {/* Trending */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-5 h-5 text-orange-500" />
                <span className="text-sm font-medium text-orange-500">এই সপ্তাহে</span>
              </div>
              <h2 className="section-title">ট্রেন্ডিং AI টুলস</h2>
            </div>
            <Link href="/tools?filter=trending" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              সব দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {tools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
          <div className="mt-4 md:hidden">
            <Link href="/tools?filter=trending" className="btn-secondary w-full justify-center">
              সব ট্রেন্ডিং টুলস <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* New Tools */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <span className="text-sm font-medium text-purple-500">সদ্য যুক্ত</span>
              </div>
              <h2 className="section-title">নতুন AI টুলস</h2>
            </div>
            <Link href="/tools?filter=new" className="hidden md:flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
              সব দেখুন <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {newTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
