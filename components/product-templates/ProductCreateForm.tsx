'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, ImageIcon, Loader2, Plus, X } from 'lucide-react'
import { toast } from 'sonner'
import { PRODUCT_TEMPLATE_CATEGORY_LABELS } from '@/lib/product-template-categories'
import type { ProductTemplate } from '@/types'

export function ProductCreateForm({
  templates,
  initialTemplate,
}: {
  templates: ProductTemplate[]
  initialTemplate: ProductTemplate
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [template, setTemplate] = useState(initialTemplate)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [name, setName] = useState('')
  const [userPrompt, setUserPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  function handleTemplateChange(templateId: string) {
    const nextTemplate = templates.find((item) => item.id === templateId)
    if (!nextTemplate) return
    setTemplate(nextTemplate)
    router.replace(`/product-studio/create?template=${nextTemplate.id}`, { scroll: false })
  }

  function handleFile(file: File | null) {
    if (!file) return
    setError('')
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  async function handleSave() {
    if (!image || !name.trim()) return
    setSaving(true)
    setError('')

    const formData = new FormData()
    formData.append('image', image)
    formData.append('template_id', template.id)
    formData.append('name', name)
    formData.append('user_prompt', userPrompt)

    const response = await fetch('/api/product-products/save', { method: 'POST', body: formData })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setSaving(false)

    if (!response.ok) {
      setError(payload?.error ?? 'Save failed')
      return
    }

    toast.success('Product saved.')
    router.push('/product-studio/products')
    router.refresh()
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="max-w-xl space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Template</span>
          <div className="relative">
            <select
              value={template.id}
              onChange={(event) => handleTemplateChange(event.target.value)}
              className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm outline-none focus:border-foreground/40"
            >
              {templates.map((item) => (
                <option key={item.id} value={item.id}>
                  {PRODUCT_TEMPLATE_CATEGORY_LABELS[item.category]} - {item.name}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          </div>
        </label>

        {preview ? (
          <div className="relative overflow-hidden rounded-md border border-border bg-muted">
            <img src={preview} alt="" className="max-h-[320px] w-full object-contain" />
            <button
              type="button"
              onClick={() => {
                setImage(null)
                setPreview('')
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
              aria-label="Remove image"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(event) => event.preventDefault()}
            onDrop={(event) => {
              event.preventDefault()
              handleFile(event.dataTransfer.files[0] ?? null)
            }}
            className="flex h-56 w-full flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            <ImageIcon className="mb-2 h-7 w-7 text-muted-foreground/50" />
            Upload product image
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
        />

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">Product name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-foreground/40"
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium">User prompt</span>
          <textarea
            value={userPrompt}
            onChange={(event) => setUserPrompt(event.target.value)}
            placeholder="Example: make this product feel premium, clean, and bright"
            className="min-h-28 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40"
          />
        </label>

        {error && <p className="text-xs text-red-500">{error}</p>}

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => router.push('/product-studio/templates')}
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving || !image || !name.trim()}
            className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
            Save
          </button>
        </div>
      </div>

      <aside className="h-fit rounded-md border border-border bg-background p-3">
        <p className="mb-2 text-xs font-medium text-muted-foreground">Selected template</p>
        <img src={template.image_url} alt={template.name} className="aspect-square w-full rounded-sm object-cover" />
        <p className="mt-3 truncate text-sm font-medium">{template.name}</p>
        <p className="mt-1 text-xs text-muted-foreground">{PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category]}</p>
      </aside>
    </div>
  )
}
