'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { slugify } from '@/lib/utils'
import type { Doc } from '@/types'

interface DocFormProps {
  doc?: Doc
  categories: string[]
}

export function DocForm({ doc, categories }: DocFormProps) {
  const router = useRouter()
  const isEdit = !!doc

  const [title, setTitle] = useState(doc?.title ?? '')
  const [category, setCategory] = useState(doc?.category ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [slug, setSlug] = useState(doc?.slug ?? '')
  const [sourceUrl, setSourceUrl] = useState(doc?.source_url ?? '')
  const [content, setContent] = useState(doc?.content ?? '')
  const [orderIndex, setOrderIndex] = useState(doc?.order_index ?? 0)
  const [published, setPublished] = useState(doc?.published ?? false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const effectiveCategory = category === '__new__' ? customCategory : category

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const supabase = createClient()
    const payload = {
      title,
      category: effectiveCategory,
      slug,
      content,
      source_url: sourceUrl || null,
      order_index: orderIndex,
      published,
    }

    if (isEdit) {
      const { error } = await supabase
        .from('docs')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', doc!.id)
      if (error) { setError(error.message); setSaving(false); return }
    } else {
      const { error } = await supabase.from('docs').insert(payload)
      if (error) { setError(error.message); setSaving(false); return }
    }

    router.push('/admin')
    router.refresh()
  }

  return (
    <form onSubmit={handleSave} className="space-y-6 max-w-3xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => handleTitleChange(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="What is MCP?"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">Select category...</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
            <option value="__new__">+ New category</option>
          </select>
          {category === '__new__' && (
            <input
              type="text"
              value={customCategory}
              onChange={(e) => setCustomCategory(e.target.value)}
              required
              placeholder="New category name"
              className="mt-2 w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Slug</label>
          <input
            type="text"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            required
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="what-is-mcp"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Source URL (optional)</label>
          <input
            type="url"
            value={sourceUrl}
            onChange={(e) => setSourceUrl(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="https://..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5">Order index</label>
          <input
            type="number"
            value={orderIndex}
            onChange={(e) => setOrderIndex(parseInt(e.target.value) || 0)}
            className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1.5">Content (Markdown)</label>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          required
          rows={24}
          className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
          placeholder="# Title&#10;&#10;Write your markdown here..."
        />
      </div>

      <div className="flex items-center justify-between pt-2">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <div
            onClick={() => setPublished((p) => !p)}
            className={`relative w-10 h-5 rounded-full transition-colors ${
              published ? 'bg-foreground' : 'bg-muted border border-border'
            }`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${
                published ? 'translate-x-5' : ''
              }`}
            />
          </div>
          <span className="text-sm">Published</span>
        </label>

        <div className="flex items-center gap-3">
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {saving ? 'Saving…' : isEdit ? 'Save changes' : 'Create doc'}
          </button>
        </div>
      </div>
    </form>
  )
}
