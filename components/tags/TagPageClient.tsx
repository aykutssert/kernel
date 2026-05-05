'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Copy, ExternalLink, SlidersHorizontal, Search, X } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { PromptLikeButton } from '@/components/docs/PromptLikeButton'
import { PromptRawPreview } from '@/components/docs/PromptRawPreview'
import type { TaggedDocWithPreview } from '@/lib/prompt-preview'

type SortOption = 'default' | 'alpha' | 'newest' | 'oldest'

function tagTone(index: number) {
  const tones = [
    'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    'bg-amber-500/10 text-amber-700 dark:text-amber-400',
    'bg-rose-500/10 text-rose-600 dark:text-rose-400',
  ]
  return tones[index % tones.length]
}

function activeTagTone(index: number) {
  const tones = [
    'bg-blue-500/40 text-blue-800 dark:bg-blue-500/45 dark:text-blue-100',
    'bg-violet-500/40 text-violet-800 dark:bg-violet-500/45 dark:text-violet-100',
    'bg-emerald-500/40 text-emerald-800 dark:bg-emerald-500/45 dark:text-emerald-100',
    'bg-amber-500/45 text-amber-900 dark:bg-amber-500/45 dark:text-amber-100',
    'bg-rose-500/40 text-rose-800 dark:bg-rose-500/45 dark:text-rose-100',
  ]
  return tones[index % tones.length]
}

function promptsHref(params: { tags?: string[]; q?: string; sort?: SortOption }) {
  const search = new URLSearchParams()
  params.tags?.forEach((tag) => {
    if (tag) search.append('tag', tag)
  })
  if (params.q) search.set('q', params.q)
  if (params.sort && params.sort !== 'default') search.set('sort', params.sort)
  const query = search.toString()
  return query ? `/prompts?${query}` : '/prompts'
}

function TagDocCard({ doc }: { doc: TaggedDocWithPreview }) {
  const visibleTags = (doc.tags ?? []).slice(0, 3)
  const hiddenTags = Math.max(0, (doc.tags ?? []).length - visibleTags.length)

  async function handleCopy() {
    await navigator.clipboard.writeText(doc.content)
    toast.success('Prompt copied.')
  }

  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-foreground/30 dark:bg-[#080808]">
      <div>
        {doc.image_url ? (
          <div className="relative flex h-[260px] items-center justify-center overflow-hidden bg-muted">
            <div
              className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-xl"
              style={{ backgroundImage: `url(${doc.image_url})` }}
            />
            <img
              src={doc.image_url}
              alt={doc.title}
              loading="lazy"
              decoding="async"
              className="relative z-10 h-full w-full object-contain"
            />
            <div className="absolute inset-x-0 bottom-0 z-20 h-14 bg-gradient-to-t from-background/75 via-background/25 to-transparent dark:h-20 dark:from-[#080808] dark:via-[#080808]/70" />
            <span className="absolute right-2.5 top-2.5 z-20 rounded-md border border-border bg-background/85 px-2 py-0.5 text-[10px] font-medium text-foreground shadow-sm backdrop-blur">
              Image
            </span>
          </div>
        ) : null}

        <div className="p-3.5">
          <div className="flex items-start justify-between gap-3">
            <Link href={`/docs/${doc.category}/${doc.slug}`} className="group/title min-w-0">
              <h2 className="truncate text-sm font-semibold leading-snug tracking-tight group-hover/title:underline group-hover/title:underline-offset-4">
                {doc.title}
              </h2>
            </Link>
            {!doc.image_url && (
              <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Text</span>
            )}
          </div>
          {doc.description && (
            <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
              {doc.description}
            </p>
          )}

          <div className="mt-3">
            <PromptRawPreview html={doc.preview_html} remaining={doc.preview_remaining} />
          </div>

          {visibleTags.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-1.5">
              {visibleTags.map((t, index) => (
                <Link
                  key={t}
                  href={promptsHref({ tags: [t] })}
                  className={cn(
                    'rounded border border-transparent px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:border-current hover:brightness-110',
                    tagTone(index)
                  )}
                >
                  {t}
                </Link>
              ))}
              {hiddenTags > 0 && <span className="text-xs text-muted-foreground">+{hiddenTags}</span>}
            </div>
          )}
        </div>
      </div>

      <div className="mx-3.5 flex items-center justify-between border-t border-border py-2.5 text-muted-foreground">
        <PromptLikeButton
          docId={doc.id}
          initialCount={doc.likes_count ?? 0}
          initialLiked={doc.liked_by_me}
          compact
        />
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="transition-colors hover:text-foreground"
            aria-label="Copy prompt"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
          <Link href={`/docs/${doc.category}/${doc.slug}`} className="transition-colors hover:text-foreground" aria-label="Open doc">
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  )
}

export function TagPageClient({
  tag,
  tags = tag ? [tag] : [],
  docs,
  allTags,
  initialQuery = '',
  initialSort = 'default',
  authStatus,
}: {
  tag?: string
  tags?: string[]
  docs: TaggedDocWithPreview[]
  allTags: string[]
  initialQuery?: string
  initialSort?: SortOption
  authStatus?: string
}) {
  const router = useRouter()
  const activeTags = useMemo(() => [...new Set(tags.filter(Boolean))], [tags])
  const [sort, setSort] = useState<SortOption>(initialSort)
  const [promptQuery, setPromptQuery] = useState(initialQuery)
  const [tagQuery, setTagQuery] = useState('')
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)
  const shownAuthStatusRef = useRef<string | undefined>(undefined)
  const hasActiveFilters = activeTags.length > 0 || promptQuery.trim() !== '' || tagQuery.trim() !== '' || sort !== 'default'

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPromptQuery(initialQuery)
      setSort(initialSort)
    }, 0)

    return () => window.clearTimeout(timer)
  }, [initialQuery, initialSort])

  useEffect(() => {
    if (!authStatus || shownAuthStatusRef.current === authStatus) return

    shownAuthStatusRef.current = authStatus
    if (authStatus === 'confirmed') {
      toast.success('Email confirmed. You are signed in.')
    } else if (authStatus === 'password-updated') {
      toast.success('Password updated.')
    } else if (authStatus === 'callback-error') {
      toast.error('Auth link could not be verified.')
    }
  }, [authStatus])

  function clearFilters() {
    setPromptQuery('')
    setTagQuery('')
    setSort('default')
  }

  useEffect(() => {
    if (promptQuery.trim() === initialQuery.trim()) return

    const timer = window.setTimeout(() => {
      router.replace(promptsHref({ tags: activeTags, q: promptQuery.trim(), sort }), { scroll: false })
    }, 300)

    return () => window.clearTimeout(timer)
  }, [activeTags, initialQuery, promptQuery, router, sort])

  const visibleFilterTags = allTags
    .filter((t) => t.toLowerCase().includes(tagQuery.trim().toLowerCase()))
    .sort((a, b) => {
      const aActive = activeTags.includes(a)
      const bActive = activeTags.includes(b)
      if (aActive && !bActive) return -1
      if (bActive && !aActive) return 1
      return a.localeCompare(b)
    })

  const grouped = docs.reduce<Record<string, TaggedDocWithPreview[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  function updateSort(nextSort: SortOption) {
    setSort(nextSort)
    router.replace(promptsHref({ tags: activeTags, q: promptQuery.trim(), sort: nextSort }), { scroll: false })
  }

  return (
    <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[240px_1fr]">
      <div className="flex min-h-5 items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Prompts</p>
          <span className="text-xs text-muted-foreground">
            {docs.length} result{docs.length !== 1 ? 's' : ''}
          </span>
      </div>
      <div className="hidden min-h-5 lg:block" />

      <aside className="lg:sticky lg:top-[117px] lg:self-start">
        <div className="space-y-5 rounded-md border border-border bg-background p-4 lg:max-h-[calc(100vh-133px)] lg:overflow-y-auto">
          <div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Filters</p>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen((open) => !open)}
                  className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent lg:hidden"
                >
                  <SlidersHorizontal className="h-3 w-3" />
                  Filter
                </button>
                {hasActiveFilters ? (
                  <Link
                    href="/prompts"
                    onClick={clearFilters}
                    className="inline-flex items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[11px] font-medium text-foreground transition-colors hover:bg-accent"
                  >
                    <X className="h-3 w-3" />
                    Clear
                  </Link>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded border border-border px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground opacity-40">
                    <X className="h-3 w-3" />
                    Clear
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="prompt-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">
              Search prompts
            </label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                id="prompt-search"
                value={promptQuery}
                onChange={(e) => setPromptQuery(e.target.value)}
                placeholder="Title, content..."
                className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40"
              />
            </div>
          </div>

          <div className={cn('space-y-5 lg:block', mobileFiltersOpen ? 'block' : 'hidden')}>
            <div>
              <label htmlFor="tag-search" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                Search tags
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="tag-search"
                  value={tagQuery}
                  onChange={(e) => setTagQuery(e.target.value)}
                  placeholder="Filter tags..."
                  className="h-8 w-full rounded-md border border-border bg-background pl-8 pr-3 text-xs outline-none transition-colors placeholder:text-muted-foreground/70 focus:border-foreground/40"
                />
              </div>
              <div className="filter-scrollbar mt-2 flex max-h-64 flex-wrap gap-1.5 overflow-y-auto pr-1">
                {visibleFilterTags.map((t, index) => {
                  const active = activeTags.includes(t)
                  const nextTags = active ? activeTags.filter((tag) => tag !== t) : [...activeTags, t]
                  return (
                    <Link
                      key={t}
                      href={promptsHref({ tags: nextTags, q: promptQuery.trim(), sort })}
                      className={cn(
                        'rounded border border-transparent px-1.5 py-0.5 text-[10px] font-medium transition-colors hover:border-current hover:brightness-110',
                        active ? activeTagTone(index) : tagTone(index)
                      )}
                    >
                      {t}
                    </Link>
                  )
                })}
              </div>
            </div>

          <div>
            <p className="mb-1.5 text-xs font-medium text-muted-foreground">Sort</p>
            <div className="grid grid-cols-2 gap-1.5 text-xs">
              {([
                ['default', 'Default'],
                ['alpha', 'A-Z'],
                ['newest', 'Newest'],
                ['oldest', 'Oldest'],
              ] as [SortOption, string][]).map(([val, label]) => (
                <button
                  key={val}
                  onClick={() => updateSort(val)}
                  className={cn(
                    'rounded-md border px-2 py-1.5 text-left font-medium transition-colors',
                    sort === val
                      ? 'border-foreground/40 bg-muted text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
          </div>
        </div>
      </aside>

      <section className="min-w-0">
        <div className="space-y-8">
          {Object.entries(grouped).map(([category, items]) => (
            <div key={category}>
              <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
                {items.map((doc) => (
                  <TagDocCard key={doc.id} doc={doc} />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
