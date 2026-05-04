'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

const TABS = [
  { label: 'Newest', shortLabel: 'Newest', value: 'newest' },
  { label: 'Most liked', shortLabel: 'Liked', value: 'liked' },
  { label: 'Most viewed', shortLabel: 'Viewed', value: 'viewed' },
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
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
      <div className="grid grid-cols-3 gap-1 rounded-lg border border-border bg-muted/40 p-1 sm:inline-flex sm:w-auto sm:items-center">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => handleSort(tab.value)}
            className={cn(
              'rounded-md px-2 py-1 text-xs font-medium transition-colors sm:px-3',
              defaultSort === tab.value
                ? 'bg-background text-foreground shadow-sm border border-border'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <span className="sm:hidden">{tab.shortLabel}</span>
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <button
        onClick={toggleNsfw}
        aria-label="Toggle NSFW content"
        className="flex shrink-0 items-center justify-between gap-2.5 sm:justify-start"
      >
        <span className="text-xs text-muted-foreground select-none">Include NSFW</span>
        <span className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          showNsfw ? 'bg-foreground' : 'bg-muted border border-border'
        )}>
          <span className={cn(
            'inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-200',
            showNsfw ? 'translate-x-[22px]' : 'translate-x-[3px]'
          )} />
        </span>
      </button>
    </div>
  )
}
