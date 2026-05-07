'use client'

import Image from 'next/image'
import { useState, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronDown, Loader2, Plus, Zap } from 'lucide-react'
import { toast } from 'sonner'
import {
  PRODUCT_IMAGE_QUALITY_OPTIONS,
  PRODUCT_IMAGE_SIZE_OPTIONS,
  getProductGenerationUnitCost,
  type ProductImageQuality,
  type ProductImageSize,
} from '@/lib/product-image-sizes'
import { PRODUCT_TEMPLATE_CATEGORY_LABELS } from '@/lib/product-template-categories'
import { UpgradeDialog } from '@/components/product-templates/UpgradeDialog'
import type { ProductUsageSnapshot } from '@/lib/product-usage'
import type { ProductProduct, ProductTemplate } from '@/types'

function AccordionField({
  label,
  badge,
  open,
  onToggle,
  children,
}: {
  label: string
  badge: string
  open: boolean
  onToggle: () => void
  children: ReactNode
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between md:hidden"
      >
        <span className="text-xs font-medium">{label}</span>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          {badge}
          <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} />
        </span>
      </button>
      <span className="mb-1.5 hidden text-xs font-medium md:block">{label}</span>
      <div className={`${open ? 'mt-1.5 block' : 'hidden'} md:mt-0 md:block`}>
        {children}
      </div>
    </div>
  )
}

export function ProductCreateForm({
  templates,
  initialTemplate,
  products,
  initialProductId,
  usage,
}: {
  templates: ProductTemplate[]
  initialTemplate: ProductTemplate
  products: ProductProduct[]
  initialProductId?: string
  usage: ProductUsageSnapshot | null
}) {
  const router = useRouter()
  const [template, setTemplate] = useState(initialTemplate)
  const [productId, setProductId] = useState(
    initialProductId && products.some((item) => item.id === initialProductId)
      ? initialProductId
      : products[0]?.id ?? ''
  )
  const [imageSize, setImageSize] = useState<ProductImageSize>('1:1')
  const [imageQuality, setImageQuality] = useState<ProductImageQuality>('medium')
  const [prompt, setPrompt] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [showUpgrade, setShowUpgrade] = useState(false)
  const [sizeOpen, setSizeOpen] = useState(false)
  const [qualityOpen, setQualityOpen] = useState(false)

  const product = products.find((item) => item.id === productId) ?? null
  const unitCost = getProductGenerationUnitCost(imageSize, imageQuality)
  const canAfford = !usage || usage.unitsRemaining >= unitCost
  const selectedSizeLabel = PRODUCT_IMAGE_SIZE_OPTIONS.find((o) => o.value === imageSize)?.label ?? imageSize
  const selectedQualityLabel = PRODUCT_IMAGE_QUALITY_OPTIONS.find((o) => o.value === imageQuality)?.label ?? imageQuality

  function handleTemplateChange(templateId: string) {
    const nextTemplate = templates.find((item) => item.id === templateId)
    if (!nextTemplate) return
    setTemplate(nextTemplate)
    const params = new URLSearchParams()
    params.set('template', nextTemplate.id)
    if (productId) params.set('product', productId)
    router.replace(`/product-studio/create?${params.toString()}`, { scroll: false })
  }

  function handleProductChange(nextProductId: string) {
    setProductId(nextProductId)
    const params = new URLSearchParams()
    params.set('template', template.id)
    params.set('product', nextProductId)
    router.replace(`/product-studio/create?${params.toString()}`, { scroll: false })
  }

  async function handlePrepare() {
    if (!productId || !canAfford) return
    setSaving(true)
    setError('')

    const response = await fetch('/api/product-results/prepare', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        product_id: productId,
        template_id: template.id,
        final_prompt: prompt,
        image_size: imageSize,
        image_quality: imageQuality,
      }),
    })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setSaving(false)

    if (!response.ok) {
      setError(payload?.error ?? 'Prepare failed')
      return
    }

    toast.success('Result draft created.')
    router.push('/product-studio/results')
    router.refresh()
  }

  if (products.length === 0) {
    return (
      <div className="flex min-h-[360px] flex-col items-center justify-center rounded-md border border-dashed border-border text-center">
        <p className="text-sm font-medium">Add a product first.</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Save a product in My Products, then use it with a template.
        </p>
        <button
          type="button"
          onClick={() => router.push('/product-studio/products')}
          className="mt-5 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
        >
          Go to My Products
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="grid gap-8 xl:grid-cols-[minmax(420px,0.85fr)_minmax(560px,1fr)]">
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

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Product</span>
            <div className="relative">
              <select
                value={productId}
                onChange={(event) => handleProductChange(event.target.value)}
                className="h-10 w-full appearance-none rounded-lg border border-border bg-background px-3 pr-9 text-sm outline-none focus:border-foreground/40"
              >
                {products.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium">Prompt</span>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              placeholder="Example: place the product in this scene with bright natural light"
              className="min-h-32 w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40"
            />
          </label>

          <AccordionField
            label="Image size"
            badge={selectedSizeLabel}
            open={sizeOpen}
            onToggle={() => setSizeOpen((o) => !o)}
          >
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_IMAGE_SIZE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setImageSize(option.value)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    imageSize === option.value
                      ? 'border-foreground bg-muted text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  <span className="block text-xs font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[11px]">{option.detail}</span>
                </button>
              ))}
            </div>
            <Image
              src="/size-comparison.webp"
              alt="Image size comparison"
              width={1200}
              height={800}
              className="mt-3 w-full rounded-md border border-border"
            />
          </AccordionField>

          <AccordionField
            label="Quality"
            badge={selectedQualityLabel}
            open={qualityOpen}
            onToggle={() => setQualityOpen((o) => !o)}
          >
            <div className="grid grid-cols-3 gap-2">
              {PRODUCT_IMAGE_QUALITY_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setImageQuality(option.value)}
                  className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                    imageQuality === option.value
                      ? 'border-foreground bg-muted text-foreground'
                      : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                  }`}
                >
                  <span className="block text-xs font-medium">{option.label}</span>
                  <span className="mt-0.5 block text-[11px]">{option.detail}</span>
                </button>
              ))}
            </div>
          </AccordionField>

          {usage && (
            <div className={`rounded-lg border px-3 py-2.5 ${canAfford ? 'border-border bg-background' : 'border-red-200 bg-red-50 dark:border-red-800/40 dark:bg-red-950/30'}`}>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs text-muted-foreground">
                    This generation will use{' '}
                    <span className="font-semibold text-foreground">{unitCost} unit{unitCost !== 1 ? 's' : ''}</span>
                  </p>
                  {canAfford ? (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {usage.unitsRemaining} units remaining this month
                    </p>
                  ) : (
                    <p className="mt-0.5 text-xs font-medium text-red-600 dark:text-red-400">
                      Not enough monthly usage remaining
                    </p>
                  )}
                </div>
                {!canAfford && (
                  <button
                    type="button"
                    onClick={() => setShowUpgrade(true)}
                    className="inline-flex shrink-0 items-center gap-1 rounded-md border border-foreground/20 bg-background px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    <Zap className="h-3 w-3" />
                    Upgrade
                  </button>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            {usage && canAfford && usage.unitsRemaining - unitCost <= 5 && usage.unitsRemaining > 0 && (
              <button
                type="button"
                onClick={() => setShowUpgrade(true)}
                className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                <Zap className="h-3 w-3" />
                Upgrade
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push('/product-studio/templates')}
              className="text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handlePrepare}
              disabled={saving || !productId || !canAfford}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Prepare
            </button>
          </div>
        </div>

        <aside className="grid h-fit gap-5 md:grid-cols-2">
          <div className="rounded-md border border-border bg-background p-3">
            <p className="mb-2 text-xs font-medium text-muted-foreground">Selected template</p>
            <div className="overflow-hidden rounded-sm bg-muted">
              <img src={template.image_url} alt={template.name} className="block w-full" />
            </div>
            <p className="mt-3 truncate text-sm font-medium">{template.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category]}</p>
          </div>

          {product && (
            <div className="rounded-md border border-border bg-background p-3">
              <p className="mb-2 text-xs font-medium text-muted-foreground">Selected product</p>
              <div className="overflow-hidden rounded-sm bg-muted">
                <img src={product.image_url} alt={product.name} className="block w-full" />
              </div>
              <p className="mt-3 truncate text-sm font-medium">{product.name}</p>
              {product.product_note && (
                <p className="mt-1 line-clamp-3 text-xs leading-5 text-muted-foreground">{product.product_note}</p>
              )}
            </div>
          )}
        </aside>
      </div>

      {showUpgrade && <UpgradeDialog onClose={() => setShowUpgrade(false)} />}
    </>
  )
}
