'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

export function CategoryTabs({ docs }: { docs: DocMeta[] }) {
  const pathname = usePathname()

  const categories = Array.from(new Set(docs.map((d) => d.category)))

  const isPets = pathname.startsWith('/pets')
  const activeCategory = isPets ? null : categories.find((cat) => pathname.startsWith(`/docs/${cat}`))

  return (
    <div className="bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-[57px] z-40 border-b">
      <div className="max-w-[1400px] mx-auto w-full px-4 md:px-0">
        <nav className="flex overflow-x-auto scrollbar-none gap-x-6 h-12">
          <Link
            href="/pets"
            className={cn(
              'group relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap shrink-0',
              isPets ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            Pets
            <div className={cn(
              'absolute bottom-0 left-0 w-full h-[1.5px] transition-colors',
              isPets ? 'bg-foreground dark:bg-[#D5A27F]' : 'bg-transparent group-hover:bg-border'
            )} />
          </Link>

          {categories.map((cat) => {
            const firstDoc = docs.find((d) => d.category === cat)
            if (!firstDoc) return null
            const href = `/docs/${cat}/${firstDoc.slug}`
            const active = activeCategory === cat
            return (
              <Link
                key={cat}
                href={href}
                className={cn(
                  'group relative h-full flex items-center text-sm font-medium transition-colors whitespace-nowrap capitalize shrink-0',
                  active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {cat}
                <div className={cn(
                  'absolute bottom-0 left-0 w-full h-[1.5px] transition-colors',
                  active ? 'bg-foreground dark:bg-[#D5A27F]' : 'bg-transparent group-hover:bg-border'
                )} />
              </Link>
            )
          })}
        </nav>
      </div>
    </div>
  )
}
