'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Heart, PawPrint, Search, X } from 'lucide-react'
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
  const [query, setQuery] = useState('')

  // High-performance memoized filtering
  const filteredItems = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (type === 'prompts') {
      if (!q) return prompts
      return prompts.filter(p => 
        p.title.toLowerCase().includes(q) || 
        p.description?.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    } else {
      if (!q) return pets
      return pets.filter(p => 
        p.display_name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q)
      )
    }
  }, [query, type, prompts, pets])

  const totalCount = type === 'prompts' ? prompts.length : pets.length
  const filteredCount = filteredItems.length

  return (
    <>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="mb-1 text-2xl font-bold tracking-tight">Library</h1>
          <p className="text-sm text-muted-foreground">Manage your saved prompts and pet companions.</p>
        </div>
        
        {/* Search Input - Studio Grade UI */}
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Search in ${type}...`}
            className="w-full rounded-full border border-border bg-muted/50 py-2 pl-9 pr-10 text-sm transition-all focus:border-foreground focus:bg-background focus:outline-none focus:ring-1 focus:ring-foreground"
          />
          {query && (
            <button 
              onClick={() => setQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      <div className="mb-8 flex items-center justify-between border-b border-border pb-2">
        <div className="flex items-center gap-2">
          <Link
            href="/account/likes?type=pets"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${type === 'pets' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <PawPrint className="h-3.5 w-3.5" />
            Pets
          </Link>
          <Link
            href="/account/likes?type=prompts"
            className={`inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-medium transition-colors ${type === 'prompts' ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
          >
            <Heart className="h-3.5 w-3.5" />
            Prompts
          </Link>
        </div>
        <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          {query ? `${filteredCount} matched` : `${totalCount} total`}
        </p>
      </div>

      {filteredCount === 0 ? (
        query ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 rounded-full bg-muted p-4">
              <Search className="h-6 w-6 text-muted-foreground/50" />
            </div>
            <p className="mb-1 text-sm font-medium">No results for &ldquo;{query}&rdquo;</p>
            <p className="text-xs text-muted-foreground">Try a different keyword or clear the search.</p>
          </div>
        ) : (
          <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border px-6 py-14 text-center">
            <div
              className="absolute inset-0 [--dot-color:hsl(var(--foreground)/0.12)] dark:[--dot-color:hsl(var(--foreground)/0.07)]"
              style={{
                backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
                backgroundSize: '22px 22px',
              }}
            />
            <Heart className="mb-4 h-8 w-8 text-muted-foreground/25" />
            <p className="mb-1 text-sm font-semibold">
              {type === 'prompts' ? 'No liked prompts yet' : 'No liked pets yet'}
            </p>
            <p className="mb-8 max-w-xs text-xs leading-5 text-muted-foreground">
              {type === 'prompts'
                ? 'Hit the heart on any prompt to save it here for quick access later.'
                : 'Tap the heart on any pet to keep your favorites in one place.'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <Link
                href={type === 'prompts' ? '/prompts' : '/pets'}
                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-foreground px-4 text-xs font-medium text-background transition-opacity hover:opacity-85"
              >
                <Heart className="h-3.5 w-3.5" />
                Browse {type === 'prompts' ? 'prompts' : 'pets'}
              </Link>
              {type === 'prompts' ? (
                <Link
                  href="/account/likes?type=pets"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <PawPrint className="h-3.5 w-3.5" />
                  View liked pets
                </Link>
              ) : (
                <Link
                  href="/account/likes?type=prompts"
                  className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-border px-4 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/25 hover:text-foreground"
                >
                  <Heart className="h-3.5 w-3.5" />
                  View liked prompts
                </Link>
              )}
            </div>
          </div>
        )
      ) : type === 'prompts' ? (
        <div className="grid items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {(filteredItems as LikedDoc[]).map((doc) => (
            <LikedPromptCard
              key={doc.id}
              doc={doc}
              onUnlike={(id) => setPrompts((current) => current.filter((item) => item.id !== id))}
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {(filteredItems as LikedPet[]).map((pet) => (
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
