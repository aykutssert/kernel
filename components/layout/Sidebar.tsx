'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

interface GroupedDocs {
  [category: string]: DocMeta[]
}

interface SidebarProps {
  docs: DocMeta[]
  onNavigate?: () => void
}

export function Sidebar({ docs, onNavigate }: SidebarProps) {
  const pathname = usePathname()

  const grouped: GroupedDocs = docs.reduce((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {} as GroupedDocs)

  return (
    <nav className="w-full pt-1.5 pb-8 pl-0 pr-4">
      {Object.entries(grouped).map(([category, pages]) => (
        <CategoryGroup
          key={category}
          category={category}
          pages={pages}
          pathname={pathname}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}


function ActiveLink({ href, active, onClick, children }: {
  href: string
  active: boolean
  onClick?: () => void
  children: React.ReactNode
}) {
  const ref = useRef<HTMLAnchorElement>(null)

  useEffect(() => {
    if (active) {
      ref.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
    }
  }, [active])

  return (
    <Link
      ref={ref}
      href={href}
      onClick={onClick}
      className={cn(
        'flex py-2 px-3 rounded-md text-sm transition-colors leading-snug',
        active
          ? 'bg-[#E5E5DF] dark:bg-[#1E1917] text-foreground dark:text-[#D5A27F] font-medium'
          : 'text-muted-foreground hover:text-foreground hover:bg-[#EEEEE8] dark:hover:bg-[#171513]'
      )}
    >
      {children}
    </Link>
  )
}

function CategoryGroup({
  category,
  pages,
  pathname,
  onNavigate,
}: {
  category: string
  pages: DocMeta[]
  pathname: string
  onNavigate?: () => void
}) {
  const [open, setOpen] = useState(true)

  return (
    <div className="mb-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full text-left mb-1 group"
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground group-hover:text-foreground transition-colors">
          {category}
        </span>
        <ChevronDown
          className={cn(
            'w-3.5 h-3.5 text-muted-foreground transition-transform',
            !open && '-rotate-90'
          )}
        />
      </button>

      {open && (
        <ul className="space-y-0.5">
          {pages.map((page) => {
            const href = `/docs/${page.category}/${page.slug}`
            const active = pathname === href
            return (
              <li key={page.id}>
                <ActiveLink
                  href={href}
                  active={active}
                  onClick={onNavigate}
                >
                  {page.title}
                </ActiveLink>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
