'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Fuse from 'fuse.js'
import { Search, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const [query, setQuery] = useState('')
  const [docs, setDocs] = useState<DocMeta[]>([])
  const [results, setResults] = useState<DocMeta[]>([])
  const [selected, setSelected] = useState(0)

  useEffect(() => {
    if (!open) return
    fetch('/api/docs')
      .then((r) => r.json())
      .then(setDocs)
  }, [open])

  useEffect(() => {
    if (!query.trim()) {
      setResults(docs.slice(0, 8))
      setSelected(0)
      return
    }
    const fuse = new Fuse(docs, { keys: ['title', 'category'], threshold: 0.4 })
    setResults(fuse.search(query).map((r) => r.item).slice(0, 8))
    setSelected(0)
  }, [query, docs])

  const navigate = useCallback(
    (doc: DocMeta) => {
      router.push(`/docs/${doc.category}/${doc.slug}`)
      onOpenChange(false)
      setQuery('')
    },
    [router, onOpenChange]
  )

  useEffect(() => {
    if (!open) return

    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') {
        e.preventDefault()
        setSelected((s) => Math.min(s + 1, results.length - 1))
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        setSelected((s) => Math.max(s - 1, 0))
      } else if (e.key === 'Enter' && results[selected]) {
        navigate(results[selected])
      } else if (e.key === 'Escape') {
        onOpenChange(false)
      }
    }

    function onMouseDown(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) {
        onOpenChange(false)
      }
    }

    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDown)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onMouseDown)
    }
  }, [open, results, selected, navigate, onOpenChange])

  if (!open) return null

  return (
    <>
      <div className="fixed inset-0 z-50" />
      <div className="fixed inset-0 z-50 flex items-start justify-center pt-[10vh] pointer-events-none">
        <div
          ref={dialogRef}
          className="w-full max-w-lg mx-4 bg-background border border-border rounded-xl shadow-2xl overflow-hidden pointer-events-auto"
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
            <Search className="w-4 h-4 text-muted-foreground shrink-0" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search docs..."
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
              ESC
            </kbd>
          </div>

          {results.length > 0 && (
            <ul className="py-2 max-h-80 overflow-y-auto">
              {results.map((doc, i) => (
                <li key={doc.id}>
                  <button
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => navigate(doc)}
                    className={cn(
                      'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors',
                      i === selected ? 'bg-accent' : 'hover:bg-accent/50'
                    )}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-sm font-medium">{doc.title}</p>
                      <p className="text-xs text-muted-foreground">{doc.category}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {query && results.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </>
  )
}
