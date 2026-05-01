'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

function MobileCategoryGroup({ category, pages, pathname }: { category: string; pages: DocMeta[]; pathname: string }) {
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const allTags = [...new Set(pages.flatMap((p) => p.tags ?? []))].sort()
  const filtered = activeTag ? pages.filter((p) => (p.tags ?? []).includes(activeTag)) : pages

  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">{category}</p>
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
  )
}

export function MobileNav({ docs }: { docs: DocMeta[] }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setOpen(false)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const grouped = docs.reduce<Record<string, DocMeta[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

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
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-[200] bg-black/40"
            onClick={() => setOpen(false)}
          />

          {/* Drawer */}
          <div className="fixed top-0 left-0 bottom-0 z-[201] w-72 bg-background border-r shadow-xl overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 flex items-center justify-between px-4 h-14 border-b bg-background">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav links */}
            <nav className="p-4 space-y-5">
              {Object.entries(grouped).map(([category, pages]) => (
                <MobileCategoryGroup
                  key={category}
                  category={category}
                  pages={pages}
                  pathname={pathname}
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
