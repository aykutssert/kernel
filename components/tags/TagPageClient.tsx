'use client'

import { useState } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

type SortOption = 'default' | 'alpha'

export function TagPageClient({ tag, docs }: { tag: string; docs: DocMeta[] }) {
  const [sort, setSort] = useState<SortOption>('default')

  const sorted = [...docs].sort((a, b) => {
    if (sort === 'alpha') return a.title.localeCompare(b.title)
    return 0
  })

  const grouped = sorted.reduce<Record<string, DocMeta[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  return (
    <>
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">Tag</p>
          <h1 className="text-2xl font-bold">#{tag}</h1>
          <p className="text-sm text-muted-foreground mt-1">{docs.length} result{docs.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex border border-border rounded-lg overflow-hidden text-xs">
          {([['default', 'Default'], ['alpha', 'A–Z']] as [SortOption, string][]).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSort(val)}
              className={cn(
                'px-3 py-1.5 transition-colors',
                sort === val ? 'bg-foreground text-background' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">{category}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((doc) => (
                <Link
                  key={doc.id}
                  href={`/docs/${doc.category}/${doc.slug}`}
                  className="group p-4 rounded-xl border border-border hover:border-foreground/20 hover:bg-muted/50 transition-all"
                >
                  <p className="font-medium text-sm group-hover:text-foreground transition-colors">{doc.title}</p>
                  {(doc.tags ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {(doc.tags ?? []).map((t) => (
                        <span
                          key={t}
                          className={cn(
                            'px-1.5 py-0.5 rounded text-[11px] font-mono',
                            t === tag ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                          )}
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
