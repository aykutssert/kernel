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
        'fixed top-20 right-4 z-40 flex flex-col gap-2 transition-all duration-300',
        visible ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 translate-x-4 pointer-events-none'
      )}
    >
      <Link
        href="/prompts"
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground shadow-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] hover:shadow-lg transition-all"
      >
        <Sparkles className="w-4 h-4 shrink-0 text-violet-500" />
        Prompts
      </Link>
      <Link
        href="/docs"
        className="group flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-2.5 text-sm font-medium text-foreground shadow-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] hover:shadow-lg transition-all"
      >
        <FileText className="w-4 h-4 shrink-0 text-blue-500" />
        Blog
      </Link>
    </div>
  )
}
