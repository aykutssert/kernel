'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Heart, PawPrint } from 'lucide-react'
import { LikedPetCard } from '@/components/account/LikedPetCard'
import { LikedPromptCard } from '@/components/account/LikedPromptCard'
import type { LikedDoc, LikedPet } from '@/lib/account'

type LikesType = 'pets' | 'prompts'

export function AccountLikesClient({
  initialPets,
  initialPrompts,
  type,
}: {
  initialPets: LikedPet[]
  initialPrompts: LikedDoc[]
  type: LikesType
}) {
  const [pets, setPets] = useState(initialPets)
  const [prompts, setPrompts] = useState(initialPrompts)
  const count = type === 'prompts' ? prompts.length : pets.length

  return (
    <>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <h1 className="mb-2 text-2xl font-bold tracking-tight">Liked</h1>
          <p className="text-sm text-muted-foreground">Items you liked while signed in.</p>
        </div>
        <p className="text-xs text-muted-foreground">
          {count} {type === 'prompts' ? 'prompt' : 'pet'}{count !== 1 ? 's' : ''}
        </p>
      </div>

      <div className="mb-8 flex items-center gap-2 border-b border-border pb-2">
        <Link
          href="/account/likes?type=pets"
          className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${type === 'pets' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <PawPrint className="h-3.5 w-3.5" />
          Pets
        </Link>
        <Link
          href="/account/likes?type=prompts"
          className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${type === 'prompts' ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className="h-3.5 w-3.5" />
          Prompts
        </Link>
      </div>

      {count === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="mb-1 text-sm font-medium">No liked {type === 'prompts' ? 'prompts' : 'pets'} yet.</p>
          <p className="mb-6 text-xs text-muted-foreground">Like {type === 'prompts' ? 'prompts' : 'pets'} while signed in and they will show up here.</p>
          <Link
            href={type === 'prompts' ? '/prompts' : '/pets'}
            className="rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Browse {type === 'prompts' ? 'prompts' : 'pets'}
          </Link>
        </div>
      ) : type === 'prompts' ? (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {prompts.map((doc) => (
            <LikedPromptCard
              key={doc.id}
              doc={doc}
              onUnlike={(id) => setPrompts((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {pets.map((pet) => (
            <LikedPetCard
              key={pet.id}
              pet={pet}
              onUnlike={(id) => setPets((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      )}
    </>
  )
}
