import { redirect } from 'next/navigation'

// This page only redirects — it must be dynamic so Next.js doesn't try to
// statically prerender it (which would throw "uncached data outside Suspense").
export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ tag: string }>
}

export default async function TagRedirectPage({ params }: Props) {
  const { tag } = await params
  redirect(`/prompts?tag=${encodeURIComponent(tag)}`)
}
