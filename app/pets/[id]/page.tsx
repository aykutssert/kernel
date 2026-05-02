import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { createPublicClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { PetViewer } from '@/components/pets/PetViewer'
import { getDocs } from '@/lib/docs'
import { Download, ExternalLink } from 'lucide-react'
import { LikeButton } from '@/components/pets/LikeButton'
import type { Pet } from '@/lib/pets'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const supabase = createPublicClient()
  const { data: pet } = await supabase.from('pets').select('display_name, description').eq('id', id).eq('published', true).eq('is_nsfw', false).single()
  if (!pet) return {}
  return { title: pet.display_name, description: pet.description ?? undefined }
}

export default async function PetPage({ params }: Props) {
  const { id } = await params
  const supabase = createPublicClient()
  const [petResult, docs] = await Promise.all([
    supabase.from('pets').select('*').eq('id', id).eq('published', true).eq('is_nsfw', false).single(),
    getDocs(),
  ])
  const pet = petResult.data as Pet | null
  if (!pet) notFound()

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="flex-1 max-w-[900px] mx-auto w-full px-4 md:px-0 py-12">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          {/* Left: info + download */}
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Codex Pet</p>
            <h1 className="text-3xl font-bold tracking-tight mb-3">{pet.display_name}</h1>
            {pet.description && (
              <p className="text-muted-foreground mb-8 leading-relaxed">{pet.description}</p>
            )}
            <div className="flex items-center gap-3">
              <a
                href={`/api/pets/download?id=${pet.id}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity"
              >
                <Download className="w-4 h-4" />
                Download .codex-pet
              </a>
              <LikeButton petId={pet.id} initialCount={pet.likes_count ?? 0} showCount />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Includes <code>pet.json</code> + <code>spritesheet.webp</code>
            </p>
            {pet.source_url && (
              <a
                href={pet.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-4 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Source
              </a>
            )}
          </div>

          {/* Right: animated viewer */}
          <div className="w-full flex justify-center md:w-auto md:block md:shrink-0">
            <PetViewer spritesheetUrl={pet.spritesheet_url} size={256} />
          </div>
        </div>
      </main>
    </div>
  )
}
