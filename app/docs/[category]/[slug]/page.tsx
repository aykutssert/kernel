import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { Sidebar } from '@/components/layout/Sidebar'
import { OnThisPage } from '@/components/layout/OnThisPage'
import { MobileOnThisPage } from '@/components/layout/MobileOnThisPage'
import { DocContent } from '@/components/docs/DocContent'
import { CopyPageButton } from '@/components/docs/CopyPageButton'
import { Navbar } from '@/components/layout/Navbar'
import { getDocs, getDoc, getAllDocParams } from '@/lib/docs'
import { ExternalLink } from 'lucide-react'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateStaticParams() {
  try {
    return await getAllDocParams()
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const doc = await getDoc(category, slug)
  if (!doc) return {}
  return {
    title: doc.title,
    description: `${doc.category} — ${doc.title}`,
  }
}

export default async function DocPage({ params }: Props) {
  const { category, slug } = await params
  const [doc, docs] = await Promise.all([getDoc(category, slug), getDocs()])

  if (!doc) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <div id="main-content" className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Left sidebar */}
        <aside className="hidden md:block w-[260px] shrink-0 border-r sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <Sidebar docs={docs} />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-6 py-8 max-w-[720px]">
          <div className="mb-6">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
              {doc.category}
            </p>
            <div className="flex items-start justify-between gap-4 mb-6">
              <h1 className="text-3xl font-bold tracking-tight leading-tight">
                {doc.title}
              </h1>
              <CopyPageButton content={doc.content} />
            </div>
          </div>

          {/* Mobile On This Page */}
          <div className="lg:hidden mb-6">
            <MobileOnThisPage content={doc.content} />
          </div>

          <DocContent content={doc.content} />

          {doc.source_url && (
            <div className="mt-10 pt-6 border-t border-border">
              <a
                href={doc.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto pl-20">
          <OnThisPage content={doc.content} />
        </aside>
      </div>
    </div>
  )
}
