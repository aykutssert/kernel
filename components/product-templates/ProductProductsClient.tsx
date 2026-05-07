'use client'

import Link from 'next/link'
import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton'
import { useRef, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, ChevronDown, Edit2, ImageIcon, Loader2, PackagePlus, Plus, Sparkles, Trash2, UserRound, X, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { PRODUCT_TEMPLATE_CATEGORIES } from '@/lib/product-template-categories'
import type { ProductProduct } from '@/types'

export function ProductProductsClient({
  products,
  signedIn,
}: {
  products: ProductProduct[]
  signedIn: boolean
}) {
  const router = useRouter()
  const fileRef = useRef<HTMLInputElement>(null)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [image, setImage] = useState<File | null>(null)
  const [preview, setPreview] = useState('')
  const [name, setName] = useState('')
  const [category, setCategory] = useState('beauty_wellness')
  const [productNote, setProductNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    function onOpen() {
      if (!signedIn) { window.dispatchEvent(new Event('kernel-auth-open')); return }
      resetForm()
      setShowForm(true)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
    window.addEventListener('kernel-add-product-open', onOpen)
    return () => window.removeEventListener('kernel-add-product-open', onOpen)
  }, [signedIn])

  function resetForm() {
    setEditingId(null)
    setImage(null)
    setPreview('')
    setName('')
    setCategory('beauty_wellness')
    setProductNote('')
    setSaving(false)
    setError('')
    setShowForm(false)
  }

  function handleFile(file: File | null) {
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
    setError('')
  }

  async function handleSaveProduct() {
    if ((!editingId && !image) || !name.trim()) return
    setSaving(true)
    setError('')

    const formData = new FormData()
    if (editingId) formData.append('id', editingId)
    if (image) formData.append('image', image)
    formData.append('name', name)
    formData.append('category', category)
    formData.append('product_note', productNote)

    const response = await fetch('/api/product-products/save', { method: 'POST', body: formData })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setSaving(false)

    if (!response.ok) {
      setError(payload?.error ?? 'Save failed')
      return
    }

    toast.success('Product saved.')
    resetForm()
    router.refresh()
  }

  function startEdit(product: ProductProduct) {
    setEditingId(product.id)
    setImage(null)
    setPreview(product.image_url)
    setName(product.name)
    setCategory(product.category)
    setProductNote(product.product_note ?? '')
    setError('')
    setShowForm(true)
  }

  async function handleDelete(product: ProductProduct) {
    setDeletingId(product.id)

    const response = await fetch('/api/product-products/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: product.id }),
    })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setDeletingId(null)

    if (!response.ok) {
      toast.error(payload?.error ?? 'Delete failed')
      return
    }

    toast.success('Product deleted.')
    if (editingId === product.id) resetForm()
    router.refresh()
  }

  function handleAddClick() {
    if (!signedIn) {
      window.dispatchEvent(new Event('kernel-auth-open'))
      return
    }
    if (showForm) {
      resetForm()
      return
    }
    resetForm()
    setShowForm(true)
  }

  return (
    <>
      {!signedIn ? (
        <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-border text-center">
          <div
            className="absolute inset-0 [--dot-color:hsl(var(--foreground)/0.12)] dark:[--dot-color:hsl(var(--foreground)/0.07)]"
            style={{
              backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
              backgroundSize: '22px 22px',
            }}
          />
          <UserRound className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">Sign in to save products.</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Your uploaded products will stay tied to your account.
          </p>
        </div>
      ) : (
        <>
          {showForm && (
            <div className="mb-6 grid gap-5 rounded-md border border-border p-4 lg:grid-cols-[minmax(0,1fr)_280px]">
              <div className="space-y-4">
                {preview ? (
                  <div className="relative overflow-hidden rounded-md border border-border bg-muted">
                    <ImageWithSkeleton src={preview} alt="" skeletonAspect="1/1" />
                    {editingId && !image && (
                      <button
                        type="button"
                        onClick={() => fileRef.current?.click()}
                        className="absolute right-2 top-2 rounded-md bg-background/90 px-2.5 py-1.5 text-xs font-medium text-foreground shadow transition-opacity hover:opacity-90"
                      >
                        Change image
                      </button>
                    )}
                    {(!editingId || image) && (
                      <button
                        type="button"
                        onClick={() => { setImage(null); setPreview('') }}
                        className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-background/90 text-foreground shadow"
                        aria-label="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    )}
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
                    className="flex h-52 w-full flex-col items-center justify-center rounded-md border border-dashed border-border text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
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
                  <span className="mb-1.5 block text-xs font-medium">Product note</span>
                  <textarea
                    value={productNote}
                    onChange={(event) => setProductNote(event.target.value)}
                    placeholder="Example: glass jar, white label, lavender scent"
                    className="min-h-24 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40"
                  />
                </label>

                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>

              <aside className="space-y-4">
                <label className="block">
                  <span className="mb-1.5 block text-xs font-medium">Category</span>
                  <div className="relative">
                  <select
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm outline-none focus:border-foreground/40"
                  >
                    {PRODUCT_TEMPLATE_CATEGORIES.map((item) => (
                      <option key={item.value} value={item.value}>
                        {item.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </label>

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    disabled={saving || (!editingId && !image) || !name.trim()}
                    className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
                  >
                    {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                    {editingId ? 'Save changes' : 'Save'}
                  </button>
                </div>
              </aside>
            </div>
          )}

          {products.length === 0 && !showForm && (
            <div className="relative flex flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border px-6 py-12 text-center">
              <div
                className="absolute inset-0 [--dot-color:hsl(var(--foreground)/0.12)] dark:[--dot-color:hsl(var(--foreground)/0.07)]"
                style={{
                  backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
                  backgroundSize: '22px 22px',
                }}
              />
              <p className="mb-1 text-sm font-semibold">No products yet</p>
              <p className="mb-10 text-xs text-muted-foreground">Add your first product to start generating photos</p>

              <div className="flex w-full max-w-lg flex-col items-center gap-2 sm:flex-row sm:gap-0">
                <button
                  type="button"
                  onClick={handleAddClick}
                  className="group flex w-full flex-col items-center gap-2.5 rounded-xl border border-foreground/20 bg-muted/40 px-4 py-5 transition-colors hover:bg-muted/70 sm:flex-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">1</span>
                  <PackagePlus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Upload a product</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Add a photo of your product</p>
                  </div>
                </button>

                <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground/30 sm:rotate-0 sm:mx-2" />

                <Link
                  href="/product-studio/templates"
                  className="group flex w-full flex-col items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-5 transition-colors hover:border-foreground/20 hover:bg-muted/40 sm:flex-1"
                >
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">2</span>
                  <Sparkles className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Pick a template</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Choose a scene</p>
                  </div>
                </Link>

                <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground/30 sm:rotate-0 sm:mx-2" />

                <div className="flex w-full flex-col items-center gap-2.5 rounded-xl border border-dashed border-border px-4 py-5 opacity-50 sm:flex-1">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">3</span>
                  <Zap className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-xs font-semibold">Generate</p>
                    <p className="mt-0.5 text-[11px] text-muted-foreground">Get studio-quality photos</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="columns-2 gap-4 sm:columns-3 lg:columns-4 xl:columns-5">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="mb-4 break-inside-avoid overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-foreground/30"
                >
                  <Link href={`/product-studio/create?product=${product.id}`} className="group block">
                    <div className="relative overflow-hidden rounded-t-md bg-muted">
                      <ImageWithSkeleton
                        src={product.image_url}
                        alt={product.name}
                        skeletonAspect="1/1"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-background/50 opacity-0 transition-opacity group-hover:opacity-100">
                        <span className="rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background">Use</span>
                      </div>
                    </div>
                    <div className="border-t border-border p-3">
                      <p className="truncate text-sm font-medium">{product.name}</p>
                      {product.product_note && (
                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{product.product_note}</p>
                      )}
                    </div>
                  </Link>
                  <div className="flex items-center justify-end gap-1 border-t border-border px-2 py-2">
                    <button
                      type="button"
                      onClick={() => startEdit(product)}
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <ConfirmDialog
                      title="Delete product"
                      description={`"${product.name}" will be permanently deleted. Generated results for this product will also be deleted.`}
                      onConfirm={() => handleDelete(product)}
                      confirmLabel="Delete"
                    >
                      <button
                        type="button"
                        disabled={deletingId === product.id}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-red-500 disabled:opacity-50"
                      >
                        {deletingId === product.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                        Delete
                      </button>
                    </ConfirmDialog>
                  </div>
                </div>
              ))}
            </div>
          </>
      )}
    </>
  )
}
