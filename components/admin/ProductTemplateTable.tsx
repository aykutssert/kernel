'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Pencil, Search, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from './ConfirmDialog'
import { cn } from '@/lib/utils'
import { PRODUCT_TEMPLATE_CATEGORY_LABELS } from '@/lib/product-template-categories'
import type { ProductTemplate } from '@/types'

export function ProductTemplateTable({ templates: initialTemplates }: { templates: ProductTemplate[] }) {
  const router = useRouter()
  const [templates, setTemplates] = useState(initialTemplates)
  const [query, setQuery] = useState('')

  async function handleToggleActive(template: ProductTemplate) {
    setTemplates((prev) => prev.map((item) => item.id === template.id ? { ...item, is_active: !template.is_active } : item))
    const res = await fetch('/api/product-templates/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...template, is_active: !template.is_active }),
    })
    if (!res.ok) {
      setTemplates((prev) => prev.map((item) => item.id === template.id ? template : item))
      toast.error('Failed to update template.')
      return
    }
    toast.success(!template.is_active ? 'Template activated.' : 'Template deactivated.')
    router.refresh()
  }

  async function handleDelete(template: ProductTemplate) {
    const res = await fetch('/api/product-templates/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: template.id }),
    })
    if (!res.ok) {
      toast.error('Failed to delete template.')
      return
    }
    setTemplates((prev) => prev.filter((item) => item.id !== template.id))
    toast.success('Template deleted.')
    router.refresh()
  }

  const q = query.trim().toLowerCase()
  const filtered = templates.filter((template) =>
    !q ||
    template.name.toLowerCase().includes(q) ||
    PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category].toLowerCase().includes(q)
  )

  return (
    <div>
      <div className="relative mb-4">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search templates..."
          className="w-full rounded-lg border border-border bg-muted/50 py-2 pl-9 pr-8 text-sm outline-none focus:ring-1 focus:ring-ring"
        />
        {query && (
          <button onClick={() => setQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {filtered.length} template{filtered.length !== 1 ? 's' : ''}
        </p>
        <Link href="/admin/product-templates/new" className="text-xs font-medium text-muted-foreground hover:text-foreground">
          New template
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="w-16 px-4 py-3" />
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Name</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Category</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">Order</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.map((template, index) => (
              <tr key={template.id} className={index < filtered.length - 1 ? 'border-b border-border' : ''}>
                <td className="px-4 py-2">
                  <img src={template.image_url} alt="" className="h-10 w-10 rounded object-cover" />
                </td>
                <td className="px-4 py-2 font-medium">{template.name}</td>
                <td className="px-4 py-2 text-muted-foreground">
                  {PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category]}
                </td>
                <td className="px-4 py-2 text-right text-xs tabular-nums text-muted-foreground">{template.sort_order}</td>
                <td className="px-4 py-2">
                  <button
                    onClick={() => handleToggleActive(template)}
                    className={cn(
                      'rounded-full px-2 py-0.5 text-xs font-medium transition-opacity hover:opacity-70',
                      template.is_active ? 'bg-foreground text-background' : 'bg-muted text-muted-foreground'
                    )}
                  >
                    {template.is_active ? 'Active' : 'Inactive'}
                  </button>
                </td>
                <td className="px-4 py-2">
                  <div className="flex items-center justify-end gap-1">
                    <Link
                      href={`/admin/product-templates/edit/${template.id}`}
                      className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Link>
                    <ConfirmDialog
                      title="Delete template"
                      description={`"${template.name}" will be permanently deleted.`}
                      onConfirm={() => handleDelete(template)}
                    >
                      <button className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-900/20">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </ConfirmDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="py-12 text-center text-sm text-muted-foreground">No templates match your search.</p>
        )}
      </div>
    </div>
  )
}
