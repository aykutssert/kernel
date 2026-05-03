'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Search, FileText, PawPrint, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SearchDoc { id: string; title: string; category: string; slug: string; published: boolean }
interface SearchPet { id: string; display_name: string; published: boolean }

export function AdminGlobalSearch() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [docs, setDocs] = useState<SearchDoc[]>([])
  const [pets, setPets] = useState<SearchPet[]>([])
  const [loading, setLoading] = useState(false)
  const [activeIndex, setActiveIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const total = docs.length + pets.length
  const items: { href: string; label: string; sub: string; type: 'doc' | 'pet' }[] = [
    ...docs.map((d) => ({ href: `/admin/edit/${d.id}`, label: d.title, sub: d.category, type: 'doc' as const })),
    ...pets.map((p) => ({ href: `/admin/pets/edit/${p.id}`, label: p.display_name, sub: p.id, type: 'pet' as const })),
  ]

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen(true)
        setTimeout(() => inputRef.current?.focus(), 0)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!query.trim()) { setDocs([]); setPets([]); return }
    setLoading(true)
    debounceRef.current = setTimeout(async () => {
      const res = await fetch(`/api/admin/search?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const data = await res.json()
        setDocs(data.docs)
        setPets(data.pets)
        setActiveIndex(-1)
      }
      setLoading(false)
    }, 250)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [query])

  const navigate = useCallback((href: string) => {
    setOpen(false)
    setQuery('')
    router.push(href)
  }, [router])

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((i) => Math.min(i + 1, total - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIndex((i) => Math.max(i - 1, -1)) }
    else if (e.key === 'Enter' && activeIndex >= 0) navigate(items[activeIndex].href)
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 0) }}
        className="flex items-center gap-2 px-3 py-1.5 text-xs text-muted-foreground bg-muted/50 border border-border rounded-lg hover:bg-muted transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span>Search…</span>
        <kbd className="ml-1 text-[10px] bg-background border border-border rounded px-1 py-0.5">⌘K</kbd>
      </button>
    )
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2 px-3 py-1.5 bg-background border border-ring rounded-lg shadow-lg min-w-[280px]">
        <Search className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={onKeyDown}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder="Search docs and pets…"
          className="flex-1 text-sm outline-none bg-transparent placeholder:text-muted-foreground"
          autoFocus
        />
        {query && (
          <button onClick={() => setQuery('')} className="text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {query.trim() && (
        <div className="absolute top-full mt-1.5 left-0 w-full min-w-[320px] bg-background border border-border rounded-xl shadow-xl overflow-hidden z-50">
          {loading ? (
            <p className="text-xs text-muted-foreground text-center py-4">Searching…</p>
          ) : total === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">No results found.</p>
          ) : (
            <>
              {docs.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">Docs</p>
                  {docs.map((doc, i) => (
                    <button
                      key={doc.id}
                      onMouseDown={() => navigate(`/admin/edit/${doc.id}`)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                        activeIndex === i ? 'bg-accent' : 'hover:bg-muted/50'
                      )}
                    >
                      <FileText className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                      {!doc.published && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">Draft</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
              {pets.length > 0 && (
                <div className={docs.length > 0 ? 'border-t border-border' : ''}>
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-2 pb-1">Pets</p>
                  {pets.map((pet, i) => (
                    <button
                      key={pet.id}
                      onMouseDown={() => navigate(`/admin/pets/edit/${pet.id}`)}
                      className={cn(
                        'w-full flex items-center gap-2.5 px-3 py-2 text-left transition-colors',
                        activeIndex === docs.length + i ? 'bg-accent' : 'hover:bg-muted/50'
                      )}
                    >
                      <PawPrint className="w-3.5 h-3.5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate">{pet.display_name}</p>
                        <p className="text-xs text-muted-foreground font-mono">{pet.id}</p>
                      </div>
                      {!pet.published && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground shrink-0">Draft</span>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
