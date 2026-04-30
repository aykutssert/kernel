'use client'

import { useEffect, useState, useRef } from 'react'
import { cn } from '@/lib/utils'

interface Heading {
  id: string
  text: string
  level: number
}

export function OnThisPage({ content: _ }: { content: string }) {
  const [headings, setHeadings] = useState<Heading[]>([])
  const [activeId, setActiveId] = useState<string>('')
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    const elements = Array.from(
      document.querySelectorAll<HTMLElement>('main .prose h2[id], main .prose h3[id]')
    )

    const extracted: Heading[] = elements.map((el) => ({
      id: el.id,
      text: el.textContent?.replace(/\s*#\s*$/, '').trim() ?? '',
      level: el.tagName === 'H2' ? 2 : 3,
    }))

    setHeadings(extracted)

    observerRef.current?.disconnect()
    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '0px 0px -60% 0px', threshold: 0 }
    )

    elements.forEach((el) => observerRef.current!.observe(el))
    return () => observerRef.current?.disconnect()
  }, [])

  if (headings.length === 0) return null

  return (
    <nav className="py-6">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        On this page
      </p>
      <ul className="space-y-1.5">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={cn(
                'block text-sm transition-colors leading-snug',
                h.level === 3 && 'pl-3',
                activeId === h.id
                  ? 'text-foreground font-medium'
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
