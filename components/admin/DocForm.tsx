'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { slugify, cn } from '@/lib/utils'
import { ImagePlus, X } from 'lucide-react'
import type { Doc } from '@/types'

interface DocFormProps {
  doc?: Doc
  categories: string[]
  allDocs: Pick<Doc, 'id' | 'title' | 'slug' | 'category' | 'order_index'>[]
}

export function DocForm({ doc, categories, allDocs }: DocFormProps) {
  const router = useRouter()
  const isEdit = !!doc
  const fileRef = useRef<HTMLInputElement>(null)

  const [title, setTitle] = useState(doc?.title ?? '')
  const [category, setCategory] = useState(doc?.category ?? '')
  const [customCategory, setCustomCategory] = useState('')
  const [slug, setSlug] = useState(doc?.slug ?? '')
  const [sourceUrl, setSourceUrl] = useState(doc?.source_url ?? '')
  const [content, setContent] = useState(doc?.content ?? '')
  const [orderIndex, setOrderIndex] = useState(String(doc?.order_index ?? 0))
  const [published, setPublished] = useState(doc?.published ?? false)
  const [imageUrl, setImageUrl] = useState(doc?.image_url ?? '')
  const [tags, setTags] = useState<string[]>(doc?.tags ?? [])
  const [tagInput, setTagInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const [previewTab, setPreviewTab] = useState<'write' | 'preview'>('write')
  const [previewHtml, setPreviewHtml] = useState('')
  const [previewLoading, setPreviewLoading] = useState(false)

  const effectiveCategory = category === '__new__' ? customCategory : category
  const categoryDocs = allDocs
    .filter((d) => d.category === effectiveCategory && d.id !== doc?.id)
    .sort((a, b) => a.order_index - b.order_index)

  function handleTagKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const val = tagInput.trim().toLowerCase().replace(/\s+/g, '-')
      if (val && !tags.includes(val)) setTags((t) => [...t, val])
      setTagInput('')
    } else if (e.key === 'Backspace' && !tagInput && tags.length > 0) {
      setTags((t) => t.slice(0, -1))
    }
  }

  function handleCategoryChange(val: string) {
    setCategory(val)
    if (!isEdit) {
      const cat = val === '__new__' ? customCategory : val
      const catDocs = allDocs.filter((d) => d.category === cat)
      const maxIndex = catDocs.length > 0 ? Math.max(...catDocs.map((d) => d.order_index)) : -1
      setOrderIndex(String(maxIndex + 1))
    }
  }

  function handleTitleChange(val: string) {
    setTitle(val)
    if (!isEdit) setSlug(slugify(val))
  }

  async function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const form = new FormData()
    form.append('file', file)
    const res = await fetch('/api/upload', { method: 'POST', body: form })
    const data = await res.json()
    if (data.url) setImageUrl(data.url)
    else setError(data.error ?? 'Upload failed')
    setUploading(false)
  }

  async function loadPreview() {
    setPreviewLoading(true)
    const res = await fetch('/api/preview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content }),
    })
    const { html } = await res.json()
    setPreviewHtml(html)
    setPreviewLoading(false)
  }

  function handleTabChange(tab: 'write' | 'preview') {
    setPreviewTab(tab)
    if (tab === 'preview') loadPreview()
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError('')

    const duplicate = allDocs.find((d) => d.slug === slug && d.id !== doc?.id)
    if (duplicate) {
      setError(`"${slug}" slug'ı zaten kullanımda.`)
      setSaving(false)
      return
    }

    const payload = {
      title,
      category: effectiveCategory,
      slug,
      content,
      source_url: sourceUrl || null,
      order_index: parseInt(orderIndex) || 0,
      published,
      image_url: imageUrl || null,
      tags,
    }

    const parsedIndex = parseInt(orderIndex) || 0
    const indexChanged = !isEdit || doc!.order_index !== parsedIndex || doc!.category !== effectiveCategory
    const conflict = indexChanged && categoryDocs.some((d) => d.order_index === parsedIndex)

    const res = await fetch('/api/docs/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: doc?.id ?? null, payload, conflict }),
    })
    const data = await res.json()
    if (!res.ok) { setError(data.error ?? 'Save failed'); setSaving(false); return }

    router.push('/admin')
    router.refresh()
  }

  return (
    <div className="flex gap-8 items-start">
      <form onSubmit={handleSave} className="flex-1 space-y-6 min-w-0">
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
              onChange={(e) => handleCategoryChange(e.target.value)}
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
              onChange={(e) => setOrderIndex(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-1.5">Tags</label>
          <div className="flex flex-wrap gap-1.5 px-3 py-2 border border-border rounded-lg bg-background focus-within:ring-2 focus-within:ring-ring min-h-[40px]">
            {tags.map((tag) => (
              <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 bg-muted rounded text-xs font-mono">
                {tag}
                <button type="button" onClick={() => setTags((t) => t.filter((x) => x !== tag))}>
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleTagKeyDown}
              placeholder={tags.length === 0 ? 'image-prompt, text-prompt… (Enter ile ekle)' : ''}
              className="flex-1 min-w-[140px] text-sm bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Image upload */}
        <div>
          <label className="block text-sm font-medium mb-1.5">Image (optional)</label>
          {imageUrl ? (
            <div className="relative inline-block">
              <img src={imageUrl} alt="" className="h-40 rounded-lg object-cover border border-border" />
              <button
                type="button"
                onClick={async () => {
                  if (imageUrl !== (doc?.image_url ?? '')) {
                    await fetch('/api/upload', {
                      method: 'DELETE',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ url: imageUrl }),
                    })
                  }
                  setImageUrl('')
                }}
                className="absolute -top-2 -right-2 w-5 h-5 bg-foreground text-background rounded-full flex items-center justify-center"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="flex items-center gap-2 px-4 py-3 border border-dashed border-border rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors disabled:opacity-50"
            >
              <ImagePlus className="w-4 h-4" />
              {uploading ? 'Uploading…' : 'Upload image'}
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
        </div>

        {/* Content */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-sm font-medium">Content (Markdown)</label>
            <div className="flex border border-border rounded-lg overflow-hidden text-xs">
              {(['write', 'preview'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => handleTabChange(tab)}
                  className={cn(
                    'px-3 py-1 capitalize transition-colors',
                    previewTab === tab
                      ? 'bg-foreground text-background'
                      : 'text-muted-foreground hover:text-foreground'
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {previewTab === 'write' ? (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows={24}
              className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring resize-y"
              placeholder="# Title&#10;&#10;Write your markdown here..."
            />
          ) : (
            <div className="w-full min-h-[400px] px-4 py-3 border border-border rounded-lg bg-background overflow-auto">
              {previewLoading ? (
                <p className="text-sm text-muted-foreground">Loading preview…</p>
              ) : (
                <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              )}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setPublished((p) => !p)}
              className={`relative w-10 h-5 rounded-full transition-colors ${
                published ? 'bg-foreground' : 'bg-muted border border-border'
              }`}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-background shadow transition-transform ${published ? 'translate-x-5' : ''}`} />
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
            {isEdit && (
              <a
                href={`/admin/preview/${doc!.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors"
              >
                Preview
              </a>
            )}
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

      {/* Category docs sidebar */}
      {effectiveCategory && categoryDocs.length > 0 && (
        <div className="w-56 shrink-0 sticky top-[80px]">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            {effectiveCategory} ({categoryDocs.length})
          </p>
          <ul className="space-y-1">
            {categoryDocs.map((d) => (
              <li key={d.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="font-mono text-[10px] w-5 shrink-0 text-right">{d.order_index}</span>
                <span className="truncate">{d.title}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
