'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export function OnThisPage({ content: _ }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')

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

    if (elements.length === 0) return

    function updateActive() {
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 10

      if (atBottom) {
        setActiveId(elements[elements.length - 1].id)
        return
      }

      const offset = 130
      let current = elements[0].id
      for (const el of elements) {
        if (el.getBoundingClientRect().top <= offset) {
          current = el.id
        }
      }
      setActiveId(current)
    }

    updateActive()
    window.addEventListener('scroll', updateActive, { passive: true })
    return () => window.removeEventListener('scroll', updateActive)
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="pt-1.5 pb-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id} className="flex items-start gap-2">
            <span className={cn(
              'mt-[7px] w-1 h-1 rounded-full shrink-0 transition-colors',
              activeId === h.id ? 'bg-foreground' : 'bg-transparent'
            )} />
            <a
              href={`#${h.id}`}
              className={cn(
                'text-sm transition-colors leading-snug',
                h.level === 3 && 'pl-2',
                activeId === h.id
                  ? 'text-foreground dark:text-[#D5A27F] font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
