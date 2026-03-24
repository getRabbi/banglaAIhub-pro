import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'

export default async function GuideDetailPage({ params }: { params: { slug: string } }) {
  const supabase = createClient()
  const { data: post } = await supabase.from('blog_posts').select('slug').eq('slug', params.slug).single()
  if (!post) notFound()
  redirect(`/blog/${params.slug}`)
}
