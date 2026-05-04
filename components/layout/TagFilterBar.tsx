'use client'

import Link from 'next/link'
import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

export function TagFilterBar({ docs, activeTags = [] }: { docs: DocMeta[]; activeTags?: string[] }) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const allTags = [...new Set(docs.flatMap((d) => d.tags ?? []))].sort()

  const update = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  if (allTags.length === 0) return null

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="relative max-w-[1400px] mx-auto w-full px-4 md:px-0">
        <div className={cn(
          'absolute left-0 top-0 h-full w-10 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-150',
          showLeft ? 'opacity-100' : 'opacity-0'
        )} />
        <div className={cn(
          'absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-150',
          showRight ? 'opacity-100' : 'opacity-0'
        )} />
        <div
          ref={scrollRef}
          onScroll={update}
          className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-2"
        >
          {allTags.map((tag) => {
            const active = activeTags.includes(tag)
            return (
              <Link
                key={tag}
                href={`/prompts?tag=${encodeURIComponent(tag)}`}
                className={cn(
                  'shrink-0 px-2 py-0.5 rounded border border-border text-[11px] font-mono transition-colors whitespace-nowrap',
                  active
                    ? 'bg-foreground text-background'
                    : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-foreground/10'
                )}
              >
                {tag}
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
