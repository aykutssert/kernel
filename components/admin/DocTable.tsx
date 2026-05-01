'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Pencil } from 'lucide-react'
import { DeleteDocButton } from './DeleteDocButton'
import { cn } from '@/lib/utils'
import type { Doc } from '@/types'

export function DocTable({ docs }: { docs: Doc[] }) {
  const categories = ['All', ...Array.from(new Set(docs.map((d) => d.category))).sort()]
  const [active, setActive] = useState('All')

  const filtered = active === 'All' ? docs : docs.filter((d) => d.category === active)

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActive(cat)}
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
        <p className="text-xs text-muted-foreground shrink-0">{filtered.length} doc{filtered.length !== 1 ? 's' : ''}</p>
      </div>

      {filtered.length === 0 ? (
        <p className="text-center py-16 text-sm text-muted-foreground">No docs in this category.</p>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">#</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.map((doc, i) => (
                <tr key={doc.id} className={i < filtered.length - 1 ? 'border-b border-border' : ''}>
                  <td className="px-4 py-3 text-muted-foreground text-xs font-mono">{doc.order_index}</td>
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.category}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{doc.slug}</td>
                  <td className="px-4 py-3">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                      doc.published
                        ? 'bg-foreground text-background dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-muted text-muted-foreground'
                    )}>
                      {doc.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/admin/edit/${doc.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
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
