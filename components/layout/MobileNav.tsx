'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, ChevronDown, PawPrint } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

function MobileCategoryGroup({
  category,
  pages,
  pathname,
  defaultOpen,
}: {
  category: string
  pages: DocMeta[]
  pathname: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const allTags = [...new Set(pages.flatMap((p) => p.tags ?? []))].sort()
  const filtered = activeTag ? pages.filter((p) => (p.tags ?? []).includes(activeTag)) : pages

  return (
    <div className="border-b border-border last:border-0 pb-1 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {category}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="pb-2">
          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {allTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors',
                    activeTag === tag
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          <ul className="space-y-0.5">
            {filtered.map((page) => {
              const href = `/docs/${page.category}/${page.slug}`
              return (
                <li key={page.id}>
                  <Link
                    href={href}
                    className={cn(
                      'block py-1.5 px-2 rounded-md text-sm transition-colors',
                      pathname === href
                        ? 'bg-[#E5E5DF] dark:bg-[#1E1917] text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[#EEEEE8] dark:hover:bg-[#171513]'
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export function MobileNav({ docs }: { docs: DocMeta[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => { setOpen(false) }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const grouped = docs.reduce<Record<string, DocMeta[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  const activeCategory = pathname.startsWith('/docs/')
    ? pathname.split('/')[2]
    : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-1.5 rounded-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[200] bg-black/40" onClick={() => setOpen(false)} />

          <div className="fixed top-0 left-0 bottom-0 z-[201] w-72 bg-background border-r shadow-xl flex flex-col">
            <div className="sticky top-0 flex items-center justify-between px-4 h-14 border-b bg-background shrink-0">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Pets top-level link */}
              <Link
                href="/pets"
                className={cn(
                  'flex items-center gap-2 py-2 px-2 rounded-md text-sm font-medium transition-colors mb-3',
                  pathname.startsWith('/pets')
                    ? 'bg-[#E5E5DF] dark:bg-[#1E1917] text-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-[#EEEEE8] dark:hover:bg-[#171513]'
                )}
              >
                <PawPrint className="w-4 h-4" />
                Codex Pets
              </Link>

              {/* Doc categories as accordion */}
              {Object.entries(grouped).map(([category, pages]) => (
                <MobileCategoryGroup
                  key={category}
                  category={category}
                  pages={pages}
                  pathname={pathname}
                  defaultOpen={category === activeCategory}
                />
              ))}
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  )
}
