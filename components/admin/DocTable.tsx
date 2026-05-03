'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Pencil, Eye, Search, X, ChevronUp, ChevronDown, ChevronsUpDown, Copy } from 'lucide-react'
import { toast } from 'sonner'
import { DeleteDocButton } from './DeleteDocButton'
import { ReorderPanel } from './ReorderPanel'
import { cn } from '@/lib/utils'
import type { Doc } from '@/types'

type StatusFilter = 'all' | 'published' | 'draft'
type SortKey = 'order_index' | 'title' | 'updated_at' | 'published'
type SortDir = 'asc' | 'desc'

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const CONTENT_FULL = 3000

function ContentLength({ content }: { content: string }) {
  const len = content.length
  const pct = Math.min((len / CONTENT_FULL) * 100, 100)
  const color = pct < 20 ? 'bg-red-400' : pct < 60 ? 'bg-amber-400' : 'bg-emerald-400'
  return (
    <div className="flex items-center gap-2 min-w-[64px]">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs tabular-nums text-muted-foreground shrink-0">{len < 1000 ? len : `${(len / 1000).toFixed(1)}k`}</span>
    </div>
  )
}

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <ChevronsUpDown className="w-3 h-3 opacity-30" />
  return active && dir === 'asc' ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />
}

function sortDocs(docs: Doc[], key: SortKey, dir: SortDir) {
  return [...docs].sort((a, b) => {
    let cmp = 0
    if (key === 'order_index') cmp = a.order_index - b.order_index
    else if (key === 'title') cmp = a.title.localeCompare(b.title)
    else if (key === 'updated_at') cmp = a.updated_at.localeCompare(b.updated_at)
    else if (key === 'published') cmp = Number(b.published) - Number(a.published)
    return dir === 'asc' ? cmp : -cmp
  })
}

export function DocTable({ docs: initialDocs }: { docs: Doc[] }) {
  const router = useRouter()
  const [docs, setDocs] = useState(initialDocs)
  const categories = ['All', ...Array.from(new Set(docs.map((d) => d.category))).sort()]
  const [active, setActive] = useState('All')
  const [mode, setMode] = useState<'list' | 'reorder'>('list')
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortKey, setSortKey] = useState<SortKey>('order_index')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  async function handleDuplicate(id: string) {
    const res = await fetch('/api/docs/duplicate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      const { id: newId } = await res.json()
      toast.success('Doc duplicated as draft.')
      router.push(`/admin/edit/${newId}`)
    } else {
      toast.error('Failed to duplicate doc.')
    }
  }

  async function handleTogglePublish(id: string, current: boolean) {
    setDocs((prev) => prev.map((d) => d.id === id ? { ...d, published: !current } : d))
    const res = await fetch('/api/docs/publish', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, published: !current }),
    })
    if (!res.ok) {
      setDocs((prev) => prev.map((d) => d.id === id ? { ...d, published: current } : d))
      toast.error('Failed to update status.')
    } else {
      toast.success(!current ? 'Published.' : 'Moved to draft.')
      router.refresh()
    }
  }

  const q = query.trim().toLowerCase()
  const filtered = docs
    .filter((d) => active === 'All' || d.category === active)
    .filter((d) => statusFilter === 'all' || (statusFilter === 'published' ? d.published : !d.published))
    .filter((d) => !q || d.title.toLowerCase().includes(q) || d.slug.toLowerCase().includes(q) || d.category.toLowerCase().includes(q))
  const sorted = sortDocs(filtered, sortKey, sortDir)
  const reorderDocs = active !== 'All'
    ? docs.filter((d) => d.category === active).sort((a, b) => a.order_index - b.order_index)
    : []

  return (
    <div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs…"
          className="w-full pl-9 pr-8 py-2 text-sm bg-muted/50 border border-border rounded-lg outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => { setActive(cat); setMode('list') }}
              className={cn(
                'px-3 py-1 rounded-lg text-xs font-medium transition-colors',
                active === cat
                  ? 'bg-foreground text-background'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              )}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <div className="flex border border-border rounded-lg overflow-hidden text-xs">
            {(['all', 'published', 'draft'] as StatusFilter[]).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={cn(
                  'px-3 py-1 capitalize transition-colors',
                  statusFilter === s ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {s === 'all' ? 'All' : s === 'published' ? 'Published' : 'Draft'}
              </button>
            ))}
          </div>
          {active !== 'All' && (
            <div className="flex border border-border rounded-lg overflow-hidden text-xs">
              {(['list', 'reorder'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={cn(
                    'px-3 py-1 capitalize transition-colors',
                    mode === m ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {m === 'list' ? 'List' : 'Reorder'}
                </button>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground shrink-0">{filtered.length} doc{filtered.length !== 1 ? 's' : ''}</p>
        </div>
      </div>

      {mode === 'reorder' && active !== 'All' ? (
        <ReorderPanel docs={reorderDocs} category={active} />
      ) : filtered.length === 0 ? (
        <p className="text-center py-16 text-sm text-muted-foreground">{query ? 'No docs match your search.' : 'No docs in this category.'}</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                {([['order_index', '#'], ['title', 'Title'], ['category', 'Category'], ['slug', 'Slug'], ['updated_at', 'Updated'], ['content', 'Length'], ['published', 'Status']] as [SortKey | string, string][]).map(([key, label]) => {
                  const sortable = ['order_index', 'title', 'updated_at', 'published'].includes(key)
                  return (
                    <th
                      key={key}
                      onClick={sortable ? () => handleSort(key as SortKey) : undefined}
                      className={cn('text-left px-4 py-3 font-medium text-muted-foreground', sortable && 'cursor-pointer select-none hover:text-foreground')}
                    >
                      <span className="inline-flex items-center gap-1">
                        {label}
                        {sortable && <SortIcon active={sortKey === key} dir={sortDir} />}
                      </span>
                    </th>
                  )
                })}
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {sorted.map((doc, i) => (
                <tr key={doc.id} className={i < sorted.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{doc.order_index}</td>
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.category}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{doc.slug}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{fmtDate(doc.updated_at)}</td>
                  <td className="px-4 py-3"><ContentLength content={doc.content} /></td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleTogglePublish(doc.id, doc.published)}
                      className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium transition-opacity hover:opacity-70',
                        doc.published
                          ? 'bg-foreground text-background dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      )}
                    >
                      {doc.published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/admin/preview/${doc.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                      <Link
                        href={`/admin/edit/${doc.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDuplicate(doc.id)}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                        title="Duplicate"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <DeleteDocButton id={doc.id} title={doc.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
