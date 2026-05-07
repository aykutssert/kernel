'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { PRODUCT_TEMPLATE_CATEGORY_LABELS } from '@/lib/product-template-categories'
import type { ProductTemplate } from '@/types'

function ProductTemplateCard({
  template,
  onPreview,
}: {
  template: ProductTemplate
  onPreview: (template: ProductTemplate) => void
}) {
  return (
    <article className="mb-4 break-inside-avoid overflow-hidden rounded-md border border-border bg-background transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/30 dark:bg-[#080808]">
      <button
        type="button"
        onClick={() => onPreview(template)}
        className="relative flex h-[260px] w-full items-center justify-center overflow-hidden bg-muted text-left"
        aria-label={`Preview ${template.name}`}
      >
        <div
          className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-xl"
          style={{ backgroundImage: `url(${template.image_url})` }}
        />
        <img
          src={template.image_url}
          alt={template.name}
          loading="lazy"
          decoding="async"
          className="relative z-10 h-full w-full object-cover"
        />
      </button>

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => onPreview(template)}
            className="min-w-0 text-left"
          >
            <h2 className="truncate text-sm font-semibold leading-snug tracking-tight hover:underline hover:underline-offset-4">
              {template.name}
            </h2>
          </button>
          <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
            {PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category]}
          </span>
        </div>
      </div>

      <div className="mx-3.5 flex items-center justify-between border-t border-border py-2.5">
        <span className="text-xs text-muted-foreground">Scene reference</span>
        <Link
          href={`/product-studio/create?template=${template.id}`}
          className="rounded-md border border-foreground/15 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
        >
          Use template
        </Link>
      </div>
    </article>
  )
}

function TemplateLightbox({
  template,
  onClose,
}: {
  template: ProductTemplate
  onClose: () => void
}) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] bg-background/85 backdrop-blur-sm">
      <button
        type="button"
        className="absolute inset-0 cursor-default"
        aria-label="Close preview"
        onClick={onClose}
      />
      <div className="relative z-10 flex h-dvh items-center justify-center p-4 sm:p-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-md border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{template.name}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {PRODUCT_TEMPLATE_CATEGORY_LABELS[template.category]}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <Link
                href={`/product-studio/create?template=${template.id}`}
                className="rounded-md border border-foreground/15 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                Use template
              </Link>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                aria-label="Close preview"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex max-h-[calc(100dvh-160px)] items-center justify-center bg-muted/30 p-2 sm:p-4">
            <img
              src={template.image_url}
              alt={template.name}
              className="max-h-[calc(100dvh-192px)] w-auto max-w-full rounded-sm object-contain"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductTemplateGallery({ grouped }: { grouped: Record<string, ProductTemplate[]> }) {
  const [preview, setPreview] = useState<ProductTemplate | null>(null)

  return (
    <>
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <section key={category}>
            <div className="mb-3 flex items-center justify-between gap-4">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category}
              </h2>
              <span className="text-xs text-muted-foreground">
                {items.length} template{items.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="columns-1 gap-4 sm:columns-2 lg:columns-3 xl:columns-4">
              {items.map((template) => (
                <ProductTemplateCard key={template.id} template={template} onPreview={setPreview} />
              ))}
            </div>
          </section>
        ))}
      </div>
      {preview && <TemplateLightbox template={preview} onClose={() => setPreview(null)} />}
    </>
  )
}
