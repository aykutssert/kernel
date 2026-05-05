import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { TagPageClient } from '@/components/tags/TagPageClient'
import { PromptsGridSkeleton } from '@/components/prompts/PromptsGridSkeleton'
import { getAllTags, getDocs, getPromptDocs } from '@/lib/docs'
import { withPromptPreviews } from '@/lib/prompt-preview'

interface Props {
  searchParams: Promise<{ q?: string; tag?: string | string[]; sort?: string; auth?: string }>
}

export const metadata: Metadata = {
  title: 'Prompts',
  description: 'Browse and filter Kernel prompts.',
}

async function PromptsContent({ searchParams }: Props) {
  const params = await searchParams
  const tags = Array.isArray(params.tag)
    ? params.tag
    : params.tag
      ? [params.tag]
      : []
  const sort = params.sort === 'alpha' || params.sort === 'newest' || params.sort === 'oldest'
    ? params.sort
    : 'default'

  const [rawDocs, allTags] = await Promise.all([getPromptDocs(), getAllTags()])
  const docs = await withPromptPreviews(rawDocs, (doc) => doc.image_url ? 4 : 8)

  return (
    <TagPageClient
      docs={docs}
      allTags={allTags}
      tags={tags}
      initialQuery={params.q ?? ''}
      initialSort={sort}
      authStatus={params.auth}
    />
  )
}

export default async function PromptsPage({ searchParams }: Props) {
  const docs = await getDocs()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="mx-auto w-full max-w-[1400px] px-4 py-6">
        <Suspense fallback={<PromptsGridSkeleton />}>
          <PromptsContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
