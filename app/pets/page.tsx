import Link from 'next/link'
import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { PetCardCanvas } from '@/components/pets/PetCardCanvas'
import { PetsSearchBar } from '@/components/pets/PetsSearchBar'
import { PetsSortTabs } from '@/components/pets/PetsSortTabs'
import { getDocs } from '@/lib/docs'
import { ChevronLeft, ChevronRight, Download, ExternalLink, Heart } from 'lucide-react'
import { LikeButton } from '@/components/pets/LikeButton'
import { cn } from '@/lib/utils'
import type { Pet } from '@/lib/pets'

const PER_PAGE = 12

async function getPets(page: number, q: string, sort: string): Promise<{ pets: Pet[]; total: number; totalLikes: number }> {
  const supabase = createPublicClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const orderCol = sort === 'liked' ? 'likes_count' : 'created_at'

  let query = supabase
    .from('pets')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order(orderCol, { ascending: false })
    .range(from, to)

  if (q) {
    const safe = q.replace(/[%_\\]/g, '\\$&')
    query = query.or(`display_name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const [{ data, count }, { data: likesData }] = await Promise.all([
    query,
    supabase.from('pets').select('likes_count').eq('published', true),
  ])

  const totalLikes = (likesData ?? []).reduce((sum, p) => sum + (p.likes_count ?? 0), 0)
  return { pets: data ?? [], total: count ?? 0, totalLikes }
}

interface Props {
  searchParams: Promise<{ page?: string; q?: string; sort?: string }>
}

export default async function PetsPage({ searchParams }: Props) {
  const { page: pageParam, q = '', sort = 'newest' } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)
  const sortVal = sort === 'liked' ? 'liked' : 'newest'

  const [{ pets, total, totalLikes }, docs] = await Promise.all([getPets(page, q, sortVal), getDocs()])

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
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-0 py-12">
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
            <PetsSortTabs defaultSort={sortVal} />
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
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-sm font-semibold truncate">{pet.display_name}</p>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Heart className={cn('w-3 h-3', pet.likes_count > 0 ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
                        {pet.likes_count}
                      </span>
                    </div>
                    {pet.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed flex-1">{pet.description}</p>
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

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Link
                    key={p}
                    href={pageHref(p)}
                    className={cn(
                      'w-8 h-8 flex items-center justify-center rounded-lg text-sm transition-colors',
                      p === page
                        ? 'bg-foreground text-background font-medium'
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {p}
                  </Link>
                ))}

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
      </main>
    </div>
  )
}
