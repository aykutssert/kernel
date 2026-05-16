'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { useRouter } from 'next/navigation'
import { Search, FileText, X, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getRecentDocs, type RecentDoc } from '@/components/docs/DocViewTracker'

interface Result {
  id: string
  title: string
  category: string
  slug: string
  tags: string[]
  snippet: string | null
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTag?: string
  allTags?: string[]
}

export function SearchDialog({ open, onOpenChange, initialTag, allTags = [] }: SearchDialogProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [activeTag, setActiveTag] = useState(initialTag ?? '')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)
  const [recentDocs, setRecentDocs] = useState<RecentDoc[]>([])

  const fetchResults = useCallback((q: string, tag: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (tag) params.set('tag', tag)
    fetch(`/api/search?${params}`)
      .then((r) => r.json())
      .then((data) => { setResults(data); setSelected(0) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim() && !activeTag) {
      return
    }
    debounceRef.current = setTimeout(() => fetchResults(query, activeTag), query ? 300 : 0)
  }, [query, activeTag, open, fetchResults])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (!open) {
        setQuery('')
        setResults([])
      } else {
        setActiveTag(initialTag ?? '')
        setRecentDocs(getRecentDocs())
      }
    }, 0)

    return () => window.clearTimeout(timer)
  }, [open, initialTag])

  const navigate = useCallback(
    (result: Result) => {
      router.push(`/docs/${result.category}/${result.slug}`)
      onOpenChange(false)
    },
    [router, onOpenChange]
  )

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  useEffect(() => {
    if (!open) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, results.length - 1)) }
      else if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      else if (e.key === 'Enter' && results[selected]) navigate(results[selected])
      else if (e.key === 'Escape') onOpenChange(false)
    }
    function onMouseDown(e: MouseEvent) {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node)) onOpenChange(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onMouseDown)
    return () => { window.removeEventListener('keydown', onKey); document.removeEventListener('mousedown', onMouseDown) }
  }, [open, results, selected, navigate, onOpenChange])

  const resultTags = [...new Set(results.flatMap((r) => r.tags))].slice(0, 8)
  const visibleTags = query ? resultTags : allTags.slice(0, 16)

  if (!open) return null

  return createPortal(
    <>
      <div
        className="fixed inset-0 z-[200] bg-black/20"
        onClick={() => onOpenChange(false)}
      />
      <div className="fixed inset-0 z-[201] flex items-start justify-center pt-[10vh] pointer-events-none">
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
              placeholder="Search blog..."
              className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
            />
            {loading
              ? <span className="text-[10px] text-muted-foreground">…</span>
              : <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
            }
          </div>

          {activeTag && (
            <div className="flex items-center gap-2 px-4 py-2 border-b border-border bg-muted/30">
              <span className="text-xs text-muted-foreground">Filtering by tag:</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-foreground text-background text-xs font-mono">
                {activeTag}
                <button onClick={() => setActiveTag('')}><X className="w-3 h-3" /></button>
              </span>
            </div>
          )}

          {!activeTag && visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 px-4 py-2 border-b border-border">
              {visibleTags.map((tag) => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(tag)}
                  className="px-2 py-0.5 rounded text-[11px] font-mono bg-muted text-muted-foreground hover:bg-foreground hover:text-background transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {!query && recentDocs.length > 0 && (
            <div className="py-2">
              <p className="px-4 py-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/60">
                Recently viewed
              </p>
              {recentDocs.map((doc) => (
                <button
                  key={`${doc.category}/${doc.slug}`}
                  onClick={() => { router.push(`/docs/${doc.category}/${doc.slug}`); onOpenChange(false) }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-accent/50 transition-colors"
                >
                  <Clock className="w-4 h-4 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{doc.title}</p>
                    <p className="text-xs text-muted-foreground capitalize">{doc.category}</p>
                  </div>
                </button>
              ))}
            </div>
          )}

          {query && results.length > 0 && (
            <ul className="py-2 max-h-80 overflow-y-auto">
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    onMouseEnter={() => setSelected(i)}
                    onClick={() => navigate(result)}
                    className={cn(
                      'w-full flex items-start gap-3 px-4 py-2.5 text-left transition-colors',
                      i === selected ? 'bg-accent' : 'hover:bg-accent/50'
                    )}
                  >
                    <FileText className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <p className="text-xs text-muted-foreground capitalize">{result.category}</p>
                      {result.snippet && (
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 leading-relaxed">
                          {result.snippet}
                        </p>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}

          {!loading && query && results.length === 0 && (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
        </div>
      </div>
    </>,
    document.body
  )
}
