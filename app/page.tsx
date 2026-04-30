import { redirect } from 'next/navigation'
import { getDocs } from '@/lib/docs'

export default async function HomePage() {
  let first: Awaited<ReturnType<typeof getDocs>>[0] | undefined

  try {
    const docs = await getDocs()
    first = docs[0]
  } catch {}

  if (first) {
    redirect(`/docs/${first.category}/${first.slug}`)
  }

  redirect('/docs')
}
