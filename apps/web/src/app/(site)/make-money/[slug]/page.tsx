import { redirect } from 'next/navigation'
// Make money [slug] redirects to blog post
export default function MakeMoneySlugPage({ params }: { params: { slug: string } }) {
  redirect(`/blog/${params.slug}`)
}
