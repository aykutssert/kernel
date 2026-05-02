'use client'

import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { SearchDialog } from './SearchDialog'

export function SearchTrigger() {
  const [open, setOpen] = useState(false)

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

  useEffect(() => {
    const main = document.getElementById('main-content')
    if (!main) return
    if (open) {
      main.style.filter = 'blur(4px)'
      main.style.transition = 'filter 0.15s ease'
    } else {
      main.style.filter = ''
    }
    return () => {
      main.style.filter = ''
    }
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 w-full max-w-xs px-3 py-1.5 text-sm text-muted-foreground border border-border rounded-md
        hover:bg-[#EEEEE8] dark:hover:bg-[#171513]
        transition-colors"
      >
        <Search className="w-3.5 h-3.5 shrink-0" />
        <span>Search docs...</span>
        <kbd className="ml-auto hidden sm:inline-flex items-center gap-0.5 text-[10px] font-mono bg-muted rounded px-1.5 py-0.5">
          <span>⌘</span>K
        </kbd>
      </button>
      <SearchDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
