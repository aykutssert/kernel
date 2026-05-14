'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export function DiscoverWidget() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 320)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div
      className={cn(
        'fixed bottom-6 right-4 z-40 flex flex-col gap-1.5 transition-all duration-300',
        visible ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-3 pointer-events-none'
      )}
    >
      <Link
        href="/prompts"
        className="flex items-center gap-2 rounded-xl border border-border bg-background/90 backdrop-blur px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <Sparkles className="w-3.5 h-3.5 shrink-0" />
        Prompts
      </Link>
      <Link
        href="/docs"
        className="flex items-center gap-2 rounded-xl border border-border bg-background/90 backdrop-blur px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm hover:text-foreground hover:border-foreground/30 transition-colors"
      >
        <FileText className="w-3.5 h-3.5 shrink-0" />
        Blog
      </Link>
    </div>
  )
}
