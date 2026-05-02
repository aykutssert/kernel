import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import { getDocs } from '@/lib/docs'
import { Sidebar } from '@/components/layout/Sidebar'
import { OnThisPage } from '@/components/layout/OnThisPage'
import { DocContent } from '@/components/docs/DocContent'
import { CopyCodeButton } from '@/components/docs/CopyCodeButton'
import { ExternalLink, Pencil } from 'lucide-react'
import type { Doc } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function getDocById(id: string): Promise<Doc | null> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('docs').select('*').eq('id', id).single()
  return data ?? null
}

async function PreviewContent({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [doc, docs] = await Promise.all([getDocById(id), getDocs()])

  if (!doc) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      {/* Preview banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between px-4 py-2 bg-amber-500/10 border-b border-amber-500/20 text-xs text-amber-600 dark:text-amber-400">
        <span className="font-medium">Preview — {doc.published ? 'Published' : 'Draft'}</span>
        <Link
          href={`/admin/edit/${doc.id}`}
          className="flex items-center gap-1.5 hover:underline"
        >
          <Pencil className="w-3 h-3" />
          Back to editor
        </Link>
      </div>

      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        <aside className="hidden md:block w-[260px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto">
          <Sidebar docs={docs} />
        </aside>

        <main className="flex-1 min-w-0 px-4 md:pl-20 md:pr-0 py-10 max-w-[760px] pb-32">
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              {doc.category}
            </p>
            <h1 className="text-[1.75rem] font-bold tracking-tight leading-tight" style={{ fontFamily: '"Anthropic Serif Display", Georgia, "Times New Roman", Times, serif' }}>
              {doc.title}
            </h1>
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {doc.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {doc.image_url && (
            <div className="mb-8">
              <img src={doc.image_url} alt={doc.title} className="w-full rounded-xl border border-border" />
            </div>
          )}

          <DocContent content={doc.content} />
          <CopyCodeButton />

          {doc.source_url && (
            <div className="mt-10 pt-6 border-t border-border">
              <a href={doc.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            </div>
          )}
        </main>

        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[88px] h-[calc(100vh-88px)] overflow-y-auto pl-20">
          <OnThisPage content={doc.content} />
        </aside>
      </div>
    </div>
  )
}

export default function AdminPreviewPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="h-8 w-48 bg-muted animate-pulse rounded-lg m-8" />}>
      <PreviewContent params={params} />
    </Suspense>
  )
}
