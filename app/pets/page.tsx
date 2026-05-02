import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { PetCardCanvas } from '@/components/pets/PetCardCanvas'
import { getDocs } from '@/lib/docs'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pet } from '@/lib/pets'

const PER_PAGE = 12

async function getPets(page: number): Promise<{ pets: Pet[]; total: number }> {
  const supabase = createPublicClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1

  const { data, count } = await supabase
    .from('pets')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order('created_at', { ascending: false })
    .range(from, to)

  return { pets: data ?? [], total: count ?? 0 }
}

interface Props {
  searchParams: Promise<{ page?: string }>
}

export default async function PetsPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1') || 1)

  const [{ pets, total }, docs] = await Promise.all([getPets(page), getDocs()])

  const totalPages = Math.ceil(total / PER_PAGE)
  const hasPrev = page > 1
  const hasNext = page < totalPages

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-0 py-12">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">Codex Pets</h1>
            <p className="text-sm text-muted-foreground">Pixel-art companion sprites generated with OpenAI Codex.</p>
          </div>
          {totalPages > 1 && (
            <p className="text-xs text-muted-foreground shrink-0">
              {total} pets · Page {page} / {totalPages}
            </p>
          )}
        </div>

        {pets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pets yet.</p>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pets.map((pet) => (
                <Link
                  key={pet.id}
                  href={`/pets/${pet.id}`}
                  className="group border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors bg-background"
                >
                  <PetCardCanvas spritesheetUrl={pet.spritesheet_url} size={140} />
                  <div className="p-3">
                    <p className="text-sm font-medium truncate">{pet.display_name}</p>
                    {pet.description && (
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pet.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Link
                  href={`/pets?page=${page - 1}`}
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
                    href={`/pets?page=${p}`}
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
                  href={`/pets?page=${page + 1}`}
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
