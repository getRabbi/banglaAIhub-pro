import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/home/HeroSection'
import TrendingTools from '@/components/home/TrendingTools'
import CategoryGrid from '@/components/home/CategoryGrid'
import TopListsSection from '@/components/home/TopListsSection'
import MakeMoneySection from '@/components/home/MakeMoneySection'
import LatestPosts from '@/components/home/LatestPosts'
import DealsSection from '@/components/home/DealsSection'
import NewsletterSection from '@/components/home/NewsletterSection'
import FreeResourcesSection from '@/components/home/FreeResourcesSection'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'BanglaAIHub - বাংলায় সেরা AI টুলস ডিরেক্টরি',
  description: 'বাংলায় সেরা AI tools directory। ফ্রি ও পেইড AI টুলস রিভিউ, তুলনা, গাইড এবং money-making tips।',
}

export const revalidate = 3600 // ISR - revalidate every hour

export default async function HomePage() {
  const supabase = createClient()

  const [
    { data: trendingTools },
    { data: categories },
    { data: topLists },
    { data: latestPosts },
    { data: deals },
    { data: newTools },
  ] = await Promise.all([
    supabase.from('tools').select('*, category:categories(name_bn, slug, icon)').eq('status', 'published').eq('is_trending', true).order('view_count', { ascending: false }).limit(8),
    supabase.from('categories').select('*').eq('is_featured', true).order('sort_order').limit(9),
    supabase.from('top_lists').select('*').eq('status', 'published').order('view_count', { ascending: false }).limit(3),
    supabase.from('blog_posts').select('*, category:categories(name_bn, slug)').eq('status', 'published').order('published_at', { ascending: false }).limit(6),
    supabase.from('deals').select('*, tool:tools(name, logo_url, slug)').eq('status', 'published').eq('is_featured', true).limit(4),
    supabase.from('tools').select('*, category:categories(name_bn, slug, icon)').eq('status', 'published').eq('is_new', true).order('created_at', { ascending: false }).limit(6),
  ])

  return (
    <div className="min-h-screen">
      <HeroSection />
      <TrendingTools tools={trendingTools || []} newTools={newTools || []} />
      <CategoryGrid categories={categories || []} />
      <TopListsSection topLists={topLists || []} />
      <MakeMoneySection />
      <LatestPosts posts={latestPosts || []} />
      <FreeResourcesSection />
      <DealsSection deals={deals || []} />
      <NewsletterSection />
    </div>
  )
}
