import Link from 'next/link'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { ScrollToTop } from '@/components/layout/ScrollToTop'
import { PetCardCanvas } from '@/components/pets/PetCardCanvas'
import { PetsSearchBar } from '@/components/pets/PetsSearchBar'
import { PetsSortTabs } from '@/components/pets/PetsSortTabs'
import { getDocs } from '@/lib/docs'
import { getPets, PER_PAGE } from '@/lib/pets-data'
import { ChevronLeft, ChevronRight, Download, ExternalLink, Heart, Eye } from 'lucide-react'
import { LikeButton } from '@/components/pets/LikeButton'
import { cn } from '@/lib/utils'

interface Props {
  searchParams: Promise<{ page?: string; q?: string; sort?: string; nsfw?: string }>
}

async function PetsList({ searchParams }: Props) {
  const { page: pageParam, q = '', sort = 'newest', nsfw } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const sortVal = sort === 'liked' ? 'liked' : sort === 'viewed' ? 'viewed' : 'newest'
  const showNsfw = nsfw === '1'

  const { pets, total, totalLikes } = await getPets(page, q, sortVal, showNsfw)

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (sortVal !== 'newest') params.set('sort', sortVal)
    params.set('page', String(p))
    return `/pets?${params.toString()}`
  }

  return (
    <>
      <div className="flex items-end justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Codex Pets</h1>
          <p className="text-sm text-muted-foreground">Pixel-art companion sprites generated with OpenAI Codex.</p>
        </div>
        {total > 0 && (
          <div className="flex items-center gap-3 shrink-0">
            {totalLikes > 0 && (
              <span className="inline-flex items-center gap-1 text-xs text-rose-500">
                <Heart className="w-3.5 h-3.5 fill-rose-500" />
                {totalLikes.toLocaleString()}
              </span>
            )}
            <p className="text-xs text-muted-foreground">
              {total} pet{total !== 1 ? 's' : ''}{totalPages > 1 ? ` · Page ${page} / ${totalPages}` : ''}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 mb-8">
        <Suspense>
          <PetsSearchBar defaultValue={q} />
        </Suspense>
        <Suspense>
          <PetsSortTabs defaultSort={sortVal} showNsfw={showNsfw} />
        </Suspense>
      </div>

      {pets.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          {q ? `No results for "${q}".` : 'No pets yet.'}
        </p>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pets.map((pet) => (
              <div key={pet.id} className="border border-foreground/15 rounded-xl overflow-hidden bg-background flex flex-col shadow-sm">
                <Link href={`/pets/${pet.id}`} className="block hover:opacity-90 transition-opacity">
                  <PetCardCanvas spritesheetUrl={pet.spritesheet_url} size={140} />
                </Link>
                <div className="px-3 pt-3 pb-3 flex-1 flex flex-col">
                  <p className="text-sm font-semibold truncate mb-1">{pet.display_name}</p>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Eye className="w-3 h-3" />
                      {(pet.views_count ?? 0).toLocaleString()}
                    </span>
                    <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
                      <Heart className={cn('w-3 h-3', pet.likes_count > 0 ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                      {pet.likes_count.toLocaleString()}
                    </span>
                  </div>
                  {pet.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed flex-1">{pet.description}</p>
                  )}
                </div>
                <div className="px-3 pb-3 flex flex-wrap gap-2">
                  <Link
                    href={`/pets/${pet.id}`}
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border border-foreground/15 rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </Link>
                  <LikeButton petId={pet.id} initialCount={pet.likes_count} compact />
                  <a
                    href={`/api/pets/download?id=${pet.id}`}
                    className="w-full sm:flex-1 flex items-center justify-center gap-1.5 py-1.5 text-xs font-medium border border-foreground/15 rounded-lg text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <Link
                href={pageHref(page - 1)}
                className={cn(
                  'p-2 rounded-lg border border-border transition-colors',
                  hasPrev ? 'hover:bg-muted text-foreground' : 'pointer-events-none opacity-30'
                )}
                aria-disabled={!hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
              </Link>

              {(() => {
                const items: (number | 'ellipsis')[] = []
                const delta = 2
                const range = new Set([
                  1,
                  totalPages,
                  ...Array.from({ length: delta * 2 + 1 }, (_, i) => page - delta + i).filter(
                    (p) => p >= 1 && p <= totalPages
                  ),
                ])
                let prev: number | null = null
                for (const p of [...range].sort((a, b) => a - b)) {
                  if (prev !== null && p - prev > 1) items.push('ellipsis')
                  items.push(p)
                  prev = p
                }
                return items.map((item, i) =>
                  item === 'ellipsis' ? (
                    <span key={`ellipsis-${i}`} className="w-8 h-8 flex items-center justify-center text-muted-foreground text-sm">…</span>
                  ) : (
                    <Link
                      key={item}
                      href={pageHref(item)}
                      className={cn(
                        'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors',
                        item === page
                          ? 'bg-foreground text-background font-medium'
                          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                      )}
                    >
                      {item}
                    </Link>
                  )
                )
              })()}

              <Link
                href={pageHref(page + 1)}
                className={cn(
                  'p-2 rounded-lg border border-border transition-colors',
                  hasNext ? 'hover:bg-muted text-foreground' : 'pointer-events-none opacity-30'
                )}
                aria-disabled={!hasNext}
              >
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </>
      )}
    </>
  )
}

export default async function PetsPage({ searchParams }: Props) {
  const docs = await getDocs()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-0 py-12">
        <Suspense fallback={
          <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        }>
          <PetsList searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  )
}
