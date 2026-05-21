import { redirect } from "next/navigation";
export default function MakeMoneyDetail({ params }: { params: { slug: string } }) {
  redirect(`/blog/${params.slug}`);
}
