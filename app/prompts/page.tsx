import type { Metadata } from 'next'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { TagPageClient } from '@/components/tags/TagPageClient'
import { getAllTags, getDocs, getPromptDocs } from '@/lib/docs'

interface Props {
  searchParams: Promise<{ q?: string; tag?: string | string[]; sort?: string }>
}

export const metadata: Metadata = {
  title: 'Prompts',
  description: 'Browse and filter Kernel prompts.',
}

async function PromptsPageContent({ searchParams }: Props) {
  const params = await searchParams
  const tags = Array.isArray(params.tag)
    ? params.tag
    : params.tag
      ? [params.tag]
      : []
  const sort = params.sort === 'alpha' || params.sort === 'newest' || params.sort === 'oldest'
    ? params.sort
    : 'default'

  const [docs, allDocs, allTags] = await Promise.all([getPromptDocs(), getDocs(), getAllTags()])

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={allDocs} />
      <CategoryTabs docs={allDocs} />
      <div className="mx-auto w-full max-w-[1400px] px-4 py-6">
        <TagPageClient
          docs={docs}
          allTags={allTags}
          tags={tags}
          initialQuery={params.q ?? ''}
          initialSort={sort}
        />
      </div>
      <Footer />
    </div>
  )
}

export default function PromptsPage({ searchParams }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <PromptsPageContent searchParams={searchParams} />
    </Suspense>
  )
}
