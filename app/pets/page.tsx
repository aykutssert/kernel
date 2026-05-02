import Link from 'next/link'
import { Suspense } from 'react'
import { createPublicClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { PetCardCanvas } from '@/components/pets/PetCardCanvas'
import { PetsSearchBar } from '@/components/pets/PetsSearchBar'
import { getDocs } from '@/lib/docs'
import { ChevronLeft, ChevronRight, Download, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pet } from '@/lib/pets'

const PER_PAGE = 12

async function getPets(page: number, q: string): Promise<{ pets: Pet[]; total: number }> {
  const supabase = createPublicClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  let query = supabase
    .from('pets')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  if (q) {
    const safe = q.replace(/[%_\\]/g, '\\$&')
    query = query.or(`display_name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const { data, count } = await query
  return { pets: data ?? [], total: count ?? 0 }
}

interface Props {
  searchParams: Promise<{ page?: string; q?: string }>
}

export default async function PetsPage({ searchParams }: Props) {
  const { page: pageParam, q = '' } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const [{ pets, total }, docs] = await Promise.all([getPets(page, q), getDocs()])

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  function pageHref(p: number) {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
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
            <p className="text-xs text-muted-foreground shrink-0">
              {total} pet{total !== 1 ? 's' : ''}{totalPages > 1 ? ` · Page ${page} / ${totalPages}` : ''}
            </p>
          )}
        </div>

        <div className="mb-8">
          <Suspense>
            <PetsSearchBar defaultValue={q} />
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
                <div key={pet.id} className="border border-border rounded-xl overflow-hidden bg-background flex flex-col">
                  <Link href={`/pets/${pet.id}`} className="block hover:opacity-90 transition-opacity">
                    <PetCardCanvas spritesheetUrl={pet.spritesheet_url} size={140} />
                  </Link>
                  <div className="px-3 pt-3 pb-2 flex-1 flex flex-col">
                    <p className="text-sm font-semibold truncate">{pet.display_name}</p>
                    {pet.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed flex-1">{pet.description}</p>
                    )}
                  </div>
                  <div className="border-t border-border flex">
                    <Link
                      href={`/pets/${pet.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      View
                    </Link>
                    <div className="w-px bg-border" />
                    <a
                      href={`/api/pets/download?id=${pet.id}`}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
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
