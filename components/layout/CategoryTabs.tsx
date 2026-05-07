'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef, useState, useEffect, useCallback } from 'react'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

export function CategoryTabs({ docs: _docs }: { docs: DocMeta[] }) {
  void _docs
  const pathname = usePathname()
  const navRef = useRef<HTMLElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(false)

  const isProduct = pathname.startsWith('/product-studio')
  const isDevelopers = !isProduct

  const update = useCallback(() => {
    const el = navRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 4)
    setShowRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4)
  }, [])

  useEffect(() => {
    update()
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [update])

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[57px] z-40 border-b">
      <div className="relative max-w-[1400px] mx-auto w-full px-4 md:px-0">
        {/* Left fade */}
        <div className={cn(
          'absolute left-0 top-0 h-full w-12 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-150',
          showLeft ? 'opacity-100' : 'opacity-0'
        )} />
        {/* Right fade */}
        <div className={cn(
          'absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-150',
          showRight ? 'opacity-100' : 'opacity-0'
        )} />

        <nav
          ref={navRef}
          onScroll={update}
          className="flex overflow-x-auto scrollbar-none gap-x-6 h-12"
        >
          <Link
            href="/product-studio/templates"
            className={cn(
              'group relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0',
              isProduct ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Product Studio
            <div className={cn(
              'absolute bottom-0 left-0 w-full h-[1.5px] transition-colors',
              isProduct ? 'bg-foreground dark:bg-[#D5A27F]' : 'bg-transparent group-hover:bg-border'
            )} />
          </Link>

          <Link
            href="/prompts"
            className={cn(
              'group relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0',
              isDevelopers ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Developers
            <div className={cn(
              'absolute bottom-0 left-0 w-full h-[1.5px] transition-colors',
              isDevelopers ? 'bg-foreground dark:bg-[#D5A27F]' : 'bg-transparent group-hover:bg-border'
            )} />
          </Link>
        </nav>
      </div>
    </div>
  )
}
