'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Result {
  id: string
  title: string
  category: string
  slug: string
  snippet: string | null
}

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const router = useRouter()
  const dialogRef = useRef<HTMLDivElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(0)

  const fetchResults = useCallback((q: string) => {
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(q)}`)
      .then((r) => r.json())
      .then((data) => { setResults(data); setSelected(0) })
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!open) return
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => fetchResults(query), query ? 300 : 0)
  }, [query, open, fetchResults])

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]) }
  }, [open])

  const navigate = useCallback(
    (result: Result) => {
      router.push(`/docs/${result.category}/${result.slug}`)
      onOpenChange(false)
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
            {loading
              ? <span className="text-[10px] text-muted-foreground">…</span>
              : <kbd className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">ESC</kbd>
            }
          </div>

          {results.length > 0 && (
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
    </>
  )
}
