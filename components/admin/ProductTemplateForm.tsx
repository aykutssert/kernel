'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import { PRODUCT_TEMPLATE_CATEGORIES } from '@/lib/product-template-categories'
import type { ProductTemplate } from '@/types'

type Category = ProductTemplate['category']

export function ProductTemplateForm({ template }: { template?: ProductTemplate }) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [name, setName] = useState(template?.name ?? '')
  const [category, setCategory] = useState<Category>(template?.category ?? 'beauty_wellness')
  const [imageUrl, setImageUrl] = useState(template?.image_url ?? '')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [sortOrder, setSortOrder] = useState(template?.sort_order ?? 0)
  const [isActive, setIsActive] = useState(template?.is_active ?? true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setError('')
    setImageFile(file)
    setImageUrl(URL.createObjectURL(file))
  }

  async function uploadImage() {
    if (!imageFile) return imageUrl

    const formData = new FormData()
    formData.append('file', imageFile)
    const res = await fetch('/api/product-templates/upload', { method: 'POST', body: formData })
    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error ?? 'Upload failed')
    }

    return data.url as string
  }

  async function handleSave() {
    setSaving(true)
    setError('')

    let uploadedImageUrl = imageUrl
    try {
      uploadedImageUrl = await uploadImage()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed')
      setSaving(false)
      return
    }

    const res = await fetch('/api/product-templates/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: template?.id,
        name,
        category,
        image_url: uploadedImageUrl,
        previous_image_url: template?.image_url,
        sort_order: sortOrder,
        is_active: isActive,
      }),
    })
    const data = await res.json()
    setSaving(false)

    if (!res.ok) {
      setError(data.error ?? 'Save failed')
      return
    }

    toast.success('Product template saved.')
    router.push('/admin/product-templates')
    router.refresh()
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
      <div className="max-w-xl space-y-6">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Name</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          >
            {PRODUCT_TEMPLATE_CATEGORIES.map((item) => (
              <option key={item.value} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Template image</label>
          {imageUrl ? (
            <div className="relative inline-block overflow-hidden rounded-lg border border-border bg-muted">
              <img src={imageUrl} alt="" className="h-48 w-48 object-cover" />
              <button
                type="button"
                onClick={() => { setImageUrl(''); setImageFile(null) }}
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
            >
              <Upload className="h-4 w-4" />
              Upload image
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Sort order</label>
          <input
            type="number"
            value={sortOrder}
            onChange={(e) => setSortOrder(Number(e.target.value))}
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4"
          />
          Active
        </label>

        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !name.trim() || !imageUrl}
            className="rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save template'}
          </button>
          {error && <p className="text-sm text-red-500">{error}</p>}
        </div>
      </div>

      <div className="sticky top-[80px] h-fit rounded-lg border border-border p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Preview</p>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="aspect-square w-full rounded-md object-cover" />
        ) : (
          <div className="flex aspect-square items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
            No image
          </div>
        )}
      </div>
    </div>
  )
}
