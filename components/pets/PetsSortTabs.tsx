'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Most liked', value: 'liked' },
  { label: 'Most viewed', value: 'viewed' },
] as const

type SortValue = (typeof TABS)[number]['value']

export function PetsSortTabs({ defaultSort, showNsfw }: { defaultSort: SortValue; showNsfw: boolean }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  function handleSort(value: SortValue) {
    const params = new URLSearchParams(searchParams.toString())
    params.set('sort', value)
    params.delete('page')
    router.push(`/pets?${params.toString()}`)
  }

  function toggleNsfw() {
    const params = new URLSearchParams(searchParams.toString())
    if (showNsfw) params.delete('nsfw')
    else params.set('nsfw', '1')
    params.delete('page')
    router.push(`/pets?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2">
      <div className="inline-flex items-center gap-1 p-1 rounded-lg border border-border bg-muted/40">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleSort(tab.value)}
            className={cn(
              'px-3 py-1 rounded-md text-xs font-medium transition-colors',
              defaultSort === tab.value
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <button
        onClick={toggleNsfw}
        className={cn(
          'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
          showNsfw
            ? 'border-red-500/60 text-red-500 bg-red-500/10 hover:bg-red-500/15'
            : 'border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/40'
        )}
      >
        NSFW
      </button>
    </div>
  )
}
