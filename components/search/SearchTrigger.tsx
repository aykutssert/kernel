'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'

export function SearchTrigger({ allTags = [] }: { allTags?: string[] }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const root = document.getElementById('page-root')
    if (!root) return
    if (open) {
      root.style.filter = 'blur(4px)'
      root.style.transition = 'filter 0.15s ease'
    } else {
      root.style.filter = ''
    }
    return () => { root.style.filter = '' }
  }, [open])

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((o) => !o)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])


  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-2 w-full max-w-xs px-3 text-xs text-muted-foreground border border-border rounded-lg
        hover:bg-[#EEEEE8] dark:hover:bg-[#171513]
        transition-colors"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span className="hidden sm:inline">Search docs...</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-muted rounded px-1.5 py-0.5">
          <span>⌘</span>K
        </kbd>
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} allTags={allTags} />
    </>
  )
}
