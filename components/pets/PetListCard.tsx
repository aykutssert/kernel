'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Download, ExternalLink, Eye, Heart } from 'lucide-react'
import { PetCardCanvas } from '@/components/pets/PetCardCanvas'
import { LikeButton } from '@/components/pets/LikeButton'
import { cn } from '@/lib/utils'
import type { Pet } from '@/lib/pets'

export function PetListCard({ pet }: { pet: Pet }) {
  const [active, setActive] = useState(false)

  return (
    <div
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="flex flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/40 hover:shadow-md"
    >
      <Link href={`/pets/${pet.id}`} className="block">
        <PetCardCanvas spritesheetUrl={pet.spritesheet_url} size={140} active={active} />
      </Link>
      <div className="flex flex-1 flex-col px-3 pb-3 pt-3">
        <p className="mb-1 truncate text-sm font-semibold">{pet.display_name}</p>
        <div className="mb-1 flex items-center gap-2">
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            <Eye className="h-3 w-3" />
            {(pet.views_count ?? 0).toLocaleString()}
          </span>
          <span className="inline-flex items-center gap-0.5 text-xs text-muted-foreground">
            <Heart className={cn('h-3 w-3', pet.likes_count > 0 ? 'fill-rose-500 text-rose-500' : 'text-muted-foreground')} />
            {pet.likes_count.toLocaleString()}
          </span>
        </div>
        {pet.description && (
          <p className="line-clamp-2 flex-1 text-xs leading-relaxed text-muted-foreground">{pet.description}</p>
        )}
      </div>
      <div className="flex flex-wrap gap-2 px-3 pb-3">
        <Link
          href={`/pets/${pet.id}`}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-foreground/15 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          <ExternalLink className="h-3.5 w-3.5" />
          View
        </Link>
        <LikeButton petId={pet.id} initialCount={pet.likes_count} compact />
        <a
          href={`/api/pets/download?id=${pet.id}`}
          className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-foreground/15 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground sm:flex-1"
        >
          <Download className="h-3.5 w-3.5" />
          Download
        </a>
      </div>
    </div>
  )
}
