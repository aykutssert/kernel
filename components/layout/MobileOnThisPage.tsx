'use client'

import { useState, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export function MobileOnThisPage({ content: _ }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('main .prose h2[id], main .prose h3[id]')
    )
    setHeadings(
      elements.map((el) => ({
        id: el.id,
        text: el.textContent?.replace(/\s*#\s*$/, '').trim() ?? '',
        level: el.tagName === 'H2' ? 2 : 3,
      }))
    )
  }, [])

  if (headings.length === 0) return null

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-foreground hover:bg-accent/50 transition-colors"
      >
        <span>On this page</span>
        <ChevronDown
          className={cn('w-4 h-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>
      {open && (
        <ul className="px-4 pb-3 space-y-1 border-t border-border pt-2">
          {headings.map((h) => (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={() => setOpen(false)}
                className={cn(
                  'block text-sm text-muted-foreground hover:text-foreground transition-colors py-0.5',
                  h.level === 3 && 'pl-3'
                )}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
