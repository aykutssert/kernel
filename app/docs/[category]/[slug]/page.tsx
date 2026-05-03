import { notFound } from 'next/navigation'
import { Suspense } from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { Sidebar } from '@/components/layout/Sidebar'
import { OnThisPage } from '@/components/layout/OnThisPage'
import { MobileOnThisPage } from '@/components/layout/MobileOnThisPage'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { DocContent } from '@/components/docs/DocContent'
import { CopyPageButton } from '@/components/docs/CopyPageButton'
import { CopyCodeButton } from '@/components/docs/CopyCodeButton'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { getDocs, getDoc } from '@/lib/docs'
import { DocViewTracker } from '@/components/docs/DocViewTracker'
import { ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'

interface Props {
  params: Promise<{ category: string; slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category, slug } = await params
  const doc = await getDoc(category, slug)
  if (!doc) return {}
  const description = `${doc.category} — ${doc.title}`
  return {
    title: doc.title,
    description,
    openGraph: {
      title: doc.title,
      description,
      ...(doc.image_url ? { images: [{ url: doc.image_url }] } : {}),
    },
    twitter: {
      card: doc.image_url ? 'summary_large_image' : 'summary',
      title: doc.title,
      description,
      ...(doc.image_url ? { images: [doc.image_url] } : {}),
    },
  }
}

async function DocPageContent({ params }: { params: Promise<{ category: string; slug: string }> }) {
  const { category, slug } = await params
  const [doc, docs] = await Promise.all([getDoc(category, slug), getDocs()])

  if (!doc) notFound()

  const categoryDocs = docs.filter((d) => d.category === doc.category)
  const allSorted = docs
  const currentIndex = allSorted.findIndex((d) => d.id === doc.id)
  const prevDoc = currentIndex > 0 ? allSorted[currentIndex - 1] : null
  const nextDoc = currentIndex < allSorted.length - 1 ? allSorted[currentIndex + 1] : null
  const firstInCategory = categoryDocs[0]

  return (
    <div className="flex flex-col min-h-screen">
      <DocViewTracker title={doc.title} slug={doc.slug} category={doc.category} />
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <div id="main-content" className="flex flex-1 max-w-[1400px] mx-auto w-full">
        {/* Left sidebar */}
        <aside className="hidden md:block w-[260px] shrink-0 sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto">
          <Sidebar docs={docs} />
        </aside>

        {/* Content */}
        <main className="flex-1 min-w-0 px-4 md:pl-20 md:pr-0 py-10 max-w-[760px] pb-32">
          <div className="mb-8">
            <Link
              href={`/docs/${firstInCategory.category}/${firstInCategory.slug}`}
              className="text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors mb-4 inline-block"
            >
              {doc.category}
            </Link>
            <div className="flex items-start justify-between gap-4 mb-2">
              <h1 className="text-[1.75rem] font-bold tracking-tight leading-tight" style={{ fontFamily: '"Anthropic Serif Display", Georgia, "Times New Roman", Times, serif' }}>
                {doc.title}
              </h1>
              <CopyPageButton content={doc.content} />
            </div>
            {doc.tags && doc.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {doc.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/tags/${tag}`}
                    className="px-2 py-0.5 rounded text-xs font-mono bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Mobile On This Page */}
          {!doc.image_url && (
            <div className="lg:hidden mb-6">
              <MobileOnThisPage content={doc.content} />
            </div>
          )}

          {/* Image */}
          {doc.image_url && (
            <div className="relative mb-8 rounded-xl border border-border overflow-hidden flex justify-center items-center" style={{ maxHeight: '70vh' }}>
              <div
                className="absolute inset-0 scale-110 blur-2xl brightness-90"
                style={{ backgroundImage: `url(${doc.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <img
                src={doc.image_url}
                alt={doc.title}
                className="relative z-10 max-w-full max-h-[70vh] object-contain"
              />
            </div>
          )}

          <DocContent content={doc.content} />
          <CopyCodeButton />

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

          {(prevDoc || nextDoc) && (
            <div className="mt-10 pt-6 border-t border-border flex items-center justify-between gap-4">
              {prevDoc ? (
                <Link
                  href={`/docs/${prevDoc.category}/${prevDoc.slug}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Previous</p>
                    <p className="font-medium group-hover:text-foreground">{prevDoc.title}</p>
                  </div>
                </Link>
              ) : <div />}
              {nextDoc ? (
                <Link
                  href={`/docs/${nextDoc.category}/${nextDoc.slug}`}
                  className="group flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors text-right"
                >
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Next</p>
                    <p className="font-medium group-hover:text-foreground">{nextDoc.title}</p>
                  </div>
                  <ChevronRight className="w-4 h-4" />
                </Link>
              ) : <div />}
            </div>
          )}
        </main>

        {/* Right sidebar */}
        <aside className="hidden lg:block w-[260px] shrink-0 sticky top-[105px] h-[calc(100vh-105px)] overflow-y-auto pl-20">
          {(() => {
            const docTags = doc.tags ?? []
            const related = docTags.length > 0
              ? docs.filter((d) => d.id !== doc.id && (d.tags ?? []).some((t) => docTags.includes(t))).slice(0, 8)
              : []
            if (related.length > 0) {
              return (
                <div className="py-8 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Related</p>
                  {related.map((d) => (
                    <a
                      key={d.id}
                      href={`/docs/${d.category}/${d.slug}`}
                      className="block text-sm text-muted-foreground hover:text-foreground transition-colors py-1 truncate"
                    >
                      {d.title}
                    </a>
                  ))}
                </div>
              )
            }
            return <OnThisPage content={doc.content} />
          })()}
        </aside>
      </div>
      <Footer />
      <ScrollToTop />
    </div>
  )
}

export default function DocPage({ params }: Props) {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <DocPageContent params={params} />
    </Suspense>
  )
}
