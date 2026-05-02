import Link from 'next/link'
import { createPublicClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { getDocs } from '@/lib/docs'
import type { Pet } from '@/lib/pets'

async function getPublishedPets(): Promise<Pet[]> {
  const supabase = createPublicClient()
  const { data } = await supabase.from('pets').select('*').eq('published', true).order('created_at', { ascending: false })
  return data ?? []
}

export default async function PetsPage() {
  const [pets, docs] = await Promise.all([getPublishedPets(), getDocs()])

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 md:px-0 py-12">
        <div className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight mb-2">Codex Pets</h1>
          <p className="text-sm text-muted-foreground">Pixel-art companion sprites generated with OpenAI Codex.</p>
        </div>
        {pets.length === 0 ? (
          <p className="text-sm text-muted-foreground">No pets yet.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {pets.map((pet) => (
              <Link
                key={pet.id}
                href={`/pets/${pet.id}`}
                className="group border border-border rounded-xl overflow-hidden hover:border-foreground/30 transition-colors bg-background"
              >
                <div className="aspect-square bg-muted/30 flex items-center justify-center overflow-hidden">
                  <img
                    src={pet.spritesheet_url}
                    alt={pet.display_name}
                    className="w-[192px] h-[208px] object-none object-left-top"
                    style={{ imageRendering: 'pixelated' }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{pet.display_name}</p>
                  {pet.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{pet.description}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
