import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Navbar } from '@/components/layout/Navbar'
import { TagPageClient } from '@/components/tags/TagPageClient'
import { getDocs, getDocsByTag, getAllTags } from '@/lib/docs'

interface Props {
  params: Promise<{ tag: string }>
}

export async function generateStaticParams() {
  try {
    const tags = await getAllTags()
    return tags.map((tag) => ({ tag }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { tag } = await params
  return { title: `#${tag}`, description: `${tag} tagged content` }
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params
  const [docs, allDocs] = await Promise.all([getDocsByTag(tag), getDocs()])

  if (docs.length === 0) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={allDocs} />
      <div className="max-w-[1400px] mx-auto w-full px-4 py-12">
        <TagPageClient tag={tag} docs={docs} />
      </div>
    </div>
  )
}
