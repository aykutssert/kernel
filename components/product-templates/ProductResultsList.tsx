'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ArrowRight, Clock3, Download, ImageIcon, Loader2, Package, PackagePlus, Play, RotateCcw, Sparkles, Trash2, X, XCircle, Zap } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/admin/ConfirmDialog'
import { UpgradeDialog } from '@/components/product-templates/UpgradeDialog'
import { ImageWithSkeleton } from '@/components/ui/ImageWithSkeleton'
import {
  PRODUCT_IMAGE_SIZE_MAP,
  PRODUCT_IMAGE_QUALITY_OPTIONS,
  PRODUCT_IMAGE_SIZE_OPTIONS,
  getProductGenerationUnitCost,
  type ProductImageQuality,
  type ProductImageSize,
} from '@/lib/product-image-sizes'
import { PRODUCT_TEMPLATE_CATEGORY_LABELS } from '@/lib/product-template-categories'
import type { ProductUsageSnapshot } from '@/lib/product-usage'
import type { ProductResult } from '@/types'

const PAGE_SIZE = 10

function statusTone(status: ProductResult['status']) {
  if (status === 'completed') return 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
  if (status === 'failed') return 'bg-red-500/10 text-red-600 dark:text-red-400'
  if (status === 'queued') return 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
  if (status === 'processing') return 'bg-violet-500/10 text-violet-600 dark:text-violet-400'
  return 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
}

function StatusIcon({ status }: { status: ProductResult['status'] }) {
  if (status === 'failed') return <XCircle className="h-3.5 w-3.5" />
  if (status === 'completed') return <ImageIcon className="h-3.5 w-3.5" />
  return <Clock3 className="h-3.5 w-3.5" />
}

function statusLabel(status: ProductResult['status']) {
  if (status === 'queued') return 'waiting'
  return status
}

function ResultLightbox({ result, onClose }: { result: ProductResult; onClose: () => void }) {
  const hasProduct = Boolean(result.product?.image_url)
  const [view, setView] = useState<'after' | 'before'>('after')

  const src = view === 'before' && hasProduct
    ? result.product!.image_url
    : result.image_url!

  const altText = view === 'before'
    ? `Original product photo — ${result.product?.name ?? ''}`
    : result.product?.name ? `Generated photo for ${result.product.name}` : 'Generated product photo'

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') { onClose(); return }
      if (event.key === 'b' || event.key === 'B') setView('before')
      if (event.key === 'a' || event.key === 'A') setView('after')
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] bg-background/85 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close preview" onClick={onClose} />
      <div className="relative z-10 flex h-dvh items-center justify-center p-4 sm:p-10">
        <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-3 py-2.5 sm:px-4">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{result.product?.name ?? 'Product photo'}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{result.template?.name ?? 'Unknown template'}</p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              {hasProduct && (
                <div className="flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
                  <button
                    type="button"
                    onClick={() => setView('before')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      view === 'before'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Before
                  </button>
                  <button
                    type="button"
                    onClick={() => setView('after')}
                    className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                      view === 'after'
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    After
                  </button>
                </div>
              )}
              <a
                href={`/api/product-results/download?id=${result.id}`}
                className="rounded-md border border-foreground/15 px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
              >
                Download JPG
              </a>
              <button
                type="button"
                onClick={onClose}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="flex max-h-[calc(100dvh-160px)] items-center justify-center bg-muted/30 p-2 sm:p-4">
            <img
              key={view}
              src={src}
              alt={altText}
              className="max-h-[calc(100dvh-192px)] w-auto max-w-full rounded-sm object-contain"
            />
          </div>
          {hasProduct && (
            <div className="border-t border-border px-4 py-2 text-center">
              <p className="text-[10px] text-muted-foreground/50">
                Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">B</kbd> for before ·{' '}
                <kbd className="rounded border border-border bg-muted px-1 py-0.5 font-mono text-[9px]">A</kbd> for after
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function PromptEditModal({
  result,
  mode,
  text,
  imageSize,
  imageQuality,
  onChange,
  onSizeChange,
  onQualityChange,
  onConfirm,
  onClose,
  loading,
  usage,
}: {
  result: ProductResult
  mode: 'generate' | 'variation'
  text: string
  imageSize: ProductImageSize
  imageQuality: ProductImageQuality
  onChange: (text: string) => void
  onSizeChange: (size: ProductImageSize) => void
  onQualityChange: (quality: ProductImageQuality) => void
  onConfirm: () => void
  onClose: () => void
  loading: boolean
  usage: ProductUsageSnapshot | null
}) {
  const unitCost = getProductGenerationUnitCost(imageSize, imageQuality)
  const canAfford = !usage || usage.unitsRemaining >= unitCost

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape' && !loading) onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, loading])

  return (
    <div className="fixed inset-0 z-[200] bg-background/85 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" onClick={() => !loading && onClose()} />
      <div className="relative z-10 flex h-dvh items-start justify-center overflow-y-auto p-4 sm:items-center">
        <div className="w-full max-w-lg overflow-hidden rounded-xl border border-border bg-background shadow-2xl">
          <div className="flex items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold">
                {mode === 'generate' ? 'Edit prompt before generating' : 'New variation'}
              </p>
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {result.product?.name}{result.template ? ` · ${result.template.name}` : ''}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-4 p-4">
            <textarea
              value={text}
              onChange={(e) => onChange(e.target.value)}
              rows={4}
              autoFocus
              className="w-full resize-none rounded-lg border border-border bg-background px-3 py-2 text-base outline-none placeholder:text-muted-foreground/60 focus:border-foreground/40"
            />

            <div>
              <p className="mb-1.5 text-xs font-medium">Size</p>
              <div className="grid grid-cols-3 gap-2">
                {PRODUCT_IMAGE_SIZE_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onSizeChange(option.value)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      imageSize === option.value
                        ? 'border-foreground bg-muted text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="block text-xs font-medium">{option.label}</span>
                    <span className="block text-[11px]">{option.detail}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-1.5 text-xs font-medium">Quality</p>
              <div className="grid grid-cols-3 gap-2">
                {PRODUCT_IMAGE_QUALITY_OPTIONS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onQualityChange(option.value)}
                    className={`rounded-lg border px-3 py-2 text-left transition-colors ${
                      imageQuality === option.value
                        ? 'border-foreground bg-muted text-foreground'
                        : 'border-border text-muted-foreground hover:border-foreground/30 hover:text-foreground'
                    }`}
                  >
                    <span className="block text-xs font-medium">{option.label}</span>
                    <span className="block text-[11px]">{option.detail}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-muted-foreground">
              <span className={`font-medium ${canAfford ? 'text-foreground' : 'text-red-500'}`}>{unitCost} unit{unitCost !== 1 ? 's' : ''}</span>
              {usage && (
                <span className={canAfford ? '' : ' text-red-500'}>
                  {' '}· {usage.unitsRemaining} remaining
                </span>
              )}
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="text-sm text-muted-foreground transition-colors hover:text-foreground disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading || !text.trim() || !canAfford}
                className="inline-flex h-8 items-center gap-1.5 rounded-lg bg-foreground px-3 text-xs font-medium text-background transition-opacity hover:opacity-90 disabled:opacity-50"
              >
                {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {mode === 'generate' ? 'Generate' : 'Create variation'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProductResultsList({
  results,
  signedIn,
  usage,
}: {
  results: ProductResult[]
  signedIn: boolean
  usage: ProductUsageSnapshot | null
}) {
  const router = useRouter()
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [lightboxResult, setLightboxResult] = useState<ProductResult | null>(null)
  const [filterStatus, setFilterStatus] = useState('all')
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [promptModal, setPromptModal] = useState<{
    result: ProductResult
    text: string
    mode: 'generate' | 'variation'
    imageSize: ProductImageSize
    imageQuality: ProductImageQuality
  } | null>(null)
  const [modalLoading, setModalLoading] = useState(false)
  const [showUpgrade, setShowUpgrade] = useState(false)

  const hasActiveJob = results.some((r) => r.status === 'queued' || r.status === 'processing')

  useEffect(() => {
    if (!hasActiveJob) return
    const interval = window.setInterval(() => router.refresh(), 4000)
    return () => window.clearInterval(interval)
  }, [hasActiveJob, router])

  useEffect(() => {
    setVisibleCount(PAGE_SIZE)
  }, [filterStatus])

  const sorted = [...results].sort((a, b) => {
    const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    return sortOrder === 'newest' ? -diff : diff
  })
  const presentStatuses = [...new Set(results.map((r) => r.status))]
  const filtered = filterStatus === 'all' ? sorted : sorted.filter((r) => r.status === filterStatus)
  const visible = filtered.slice(0, visibleCount)
  const usageLimitReached = Boolean(usage && usage.unitsRemaining === 0)
  const pendingCount = results.filter((r) => r.status === 'pending').length

  async function handleDeleteAllPending() {
    const response = await fetch('/api/product-results/delete-pending', { method: 'DELETE' })
    const payload = await response.json().catch(() => null) as { deleted?: number; error?: string } | null
    if (!response.ok) {
      toast.error(payload?.error ?? 'Failed to delete drafts')
      return
    }
    toast.success(`${payload?.deleted ?? 0} draft${(payload?.deleted ?? 0) !== 1 ? 's' : ''} deleted.`)
    router.refresh()
  }

  function openGeneratePrompt(result: ProductResult) {
    setPromptModal({
      result,
      text: result.final_prompt ?? '',
      mode: 'generate',
      imageSize: result.image_size as ProductImageSize,
      imageQuality: result.image_quality as ProductImageQuality,
    })
  }

  function openVariationPrompt(result: ProductResult) {
    setPromptModal({
      result,
      text: result.final_prompt ?? '',
      mode: 'variation',
      imageSize: result.image_size as ProductImageSize,
      imageQuality: result.image_quality as ProductImageQuality,
    })
  }

  async function handleConfirmModal() {
    if (!promptModal) return
    const { result, text, mode, imageSize, imageQuality } = promptModal
    setModalLoading(true)

    if (mode === 'generate') {
      const response = await fetch('/api/product-results/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, prompt: text, image_size: imageSize, image_quality: imageQuality }),
      })
      const payload = await response.json().catch(() => null) as { error?: string } | null
      setModalLoading(false)
      if (!response.ok) {
        if (response.status === 402) {
          setPromptModal(null)
          setShowUpgrade(true)
          return
        }
        toast.error(payload?.error ?? 'Generate failed')
        return
      }
      setPromptModal(null)
      toast.success('Generation queued.')
      router.refresh()
    } else {
      const response = await fetch('/api/product-results/duplicate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: result.id, prompt: text, image_size: imageSize, image_quality: imageQuality }),
      })
      const payload = await response.json().catch(() => null) as { error?: string } | null
      setModalLoading(false)
      if (!response.ok) {
        toast.error(payload?.error ?? 'Failed to create variation')
        return
      }
      setPromptModal(null)
      toast.success('New variation created.')
      router.refresh()
    }
  }

  async function handleDelete(result: ProductResult) {
    setDeletingId(result.id)
    const response = await fetch('/api/product-results/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: result.id }),
    })
    const payload = await response.json().catch(() => null) as { error?: string } | null
    setDeletingId(null)
    if (!response.ok) {
      toast.error(payload?.error ?? 'Delete failed')
      return
    }
    toast.success(result.status === 'pending' ? 'Draft cancelled.' : 'Result deleted.')
    router.refresh()
  }

  if (!signedIn) {
    return (
      <div className="relative flex min-h-[360px] flex-col items-center justify-center overflow-hidden rounded-md border border-dashed border-border text-center">
        <div
          className="absolute inset-0 [--dot-color:hsl(var(--foreground)/0.12)] dark:[--dot-color:hsl(var(--foreground)/0.07)]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <PackagePlus className="mb-4 h-10 w-10 text-muted-foreground/30" />
        <p className="text-sm font-medium">Sign in to view results.</p>
        <p className="mt-1 max-w-sm text-xs text-muted-foreground">
          Prepared product photo jobs will stay tied to your account.
        </p>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="relative flex min-h-[420px] flex-col items-center justify-center overflow-hidden rounded-xl border border-dashed border-border px-6 py-12 text-center">
        <div
          className="absolute inset-0 [--dot-color:hsl(var(--foreground)/0.12)] dark:[--dot-color:hsl(var(--foreground)/0.07)]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        <p className="mb-1 text-sm font-semibold">Your generated photos will appear here</p>
        <p className="mb-10 text-xs text-muted-foreground">Follow these three steps to create your first result</p>

        <div className="flex w-full max-w-lg flex-col items-center gap-2 sm:flex-row sm:gap-0">
          <Link
            href="/product-studio/templates"
            className="group flex w-full flex-col items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-5 transition-colors hover:border-foreground/20 hover:bg-muted/40 sm:flex-1"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">1</span>
            <Sparkles className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            <div>
              <p className="text-xs font-semibold">Pick a template</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Choose a scene</p>
            </div>
          </Link>

          <ArrowRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground/30 sm:rotate-0 sm:mx-2" />

          <Link
            href="/product-studio/products"
            className="group flex w-full flex-col items-center gap-2.5 rounded-xl border border-border bg-background px-4 py-5 transition-colors hover:border-foreground/20 hover:bg-muted/40 sm:flex-1"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-muted text-[11px] font-bold text-muted-foreground">2</span>
            <Package className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
            <div>
              <p className="text-xs font-semibold">Add your product</p>
              <p className="mt-0.5 text-[11px] text-muted-foreground">Upload a product photo</p>
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
    )
  }

  return (
    <>
      {usage && (
        <div className="mb-4 rounded-md border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">Monthly usage</p>
            <p className="text-xs text-muted-foreground">
              {usage.unitsUsed}/{usage.monthlyUnits} units
            </p>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-foreground transition-all"
              style={{ width: `${usage.usagePercent}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between gap-3 text-xs text-muted-foreground">
            <span className="capitalize">{usage.planKey}</span>
            <div className="flex items-center gap-2">
              {usage.usagePercent >= 80 && usage.usagePercent < 100 && (
                <span className="text-amber-600 dark:text-amber-400">Running low —</span>
              )}
              <span>{usage.unitsRemaining} remaining</span>
              <button
                type="button"
                onClick={() => setShowUpgrade(true)}
                className="inline-flex items-center gap-1 text-muted-foreground/60 transition-colors hover:text-foreground"
              >
                <Zap className="h-3 w-3" />
                Upgrade
              </button>
            </div>
          </div>
        </div>
      )}

      {usageLimitReached && (
        <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-800/50 dark:bg-amber-950/40 dark:text-amber-400">
          Monthly usage limit reached. Upgrade your plan to generate more images.
        </div>
      )}

      <div className="mb-4 flex flex-wrap items-center gap-2">
        {(presentStatuses.length > 1 || pendingCount > 0) && (
          <>
            {(['all', ...presentStatuses] as const).map((status) => {
              const count = status === 'all' ? results.length : results.filter((r) => r.status === status).length
              return (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFilterStatus(status)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    filterStatus === status
                      ? 'bg-foreground text-background'
                      : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {status === 'all' ? 'All' : statusLabel(status as ProductResult['status'])}
                  <span className={`text-[10px] ${filterStatus === status ? 'opacity-70' : 'opacity-60'}`}>{count}</span>
                </button>
              )
            })}
            {pendingCount > 0 && (
              <ConfirmDialog
                title="Delete all drafts"
                description={`${pendingCount} pending draft${pendingCount !== 1 ? 's' : ''} will be permanently deleted.`}
                onConfirm={handleDeleteAllPending}
                confirmLabel="Delete all"
                variant="danger"
              >
                <button
                  type="button"
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                  Delete all pending
                </button>
              </ConfirmDialog>
            )}
          </>
        )}
        <button
          type="button"
          onClick={() => setSortOrder((o) => o === 'newest' ? 'oldest' : 'newest')}
          className="ml-auto inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
        </button>
      </div>

      <div className="space-y-3">
        {visible.map((result) => (
          <article key={result.id} className="flex flex-col overflow-hidden rounded-md border border-border bg-background transition-colors hover:border-foreground/30 md:flex-row">
            {result.status === 'completed' && result.image_url && (
              <button
                type="button"
                onClick={() => setLightboxResult(result)}
                className="w-full shrink-0 border-b border-border bg-muted md:w-64 md:border-b-0 md:border-r"
                aria-label="Preview result image"
              >
                <ImageWithSkeleton
                  src={result.image_url}
                  alt={result.product?.name ? `Generated product photo for ${result.product.name}` : 'Generated product photo'}
                  skeletonAspect="1/1"
                />
              </button>
            )}

            <div className="flex min-w-0 flex-1 flex-col">
              {(() => {
                const isClickable = result.status === 'completed' && Boolean(result.image_url)
                const Wrapper = isClickable ? 'button' : 'div'
                return (
                  <Wrapper
                    {...(isClickable ? { type: 'button' as const, onClick: () => setLightboxResult(result) } : {})}
                    className={`flex w-full border-b border-border text-left${isClickable ? ' transition-colors hover:bg-muted/30' : ''}`}
                  >
                    <div className="flex min-w-0 flex-1 items-center gap-2.5 border-r border-border p-3">
                      {result.template ? (
                        <>
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                            <ImageWithSkeleton
                              src={result.template.image_url}
                              alt={result.template.name}
                              fixedContainer
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0.5 text-xs text-muted-foreground">Template</p>
                            <p className="truncate text-xs font-medium">{result.template.name}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">Template deleted</p>
                      )}
                    </div>
                    <div className="flex min-w-0 flex-1 items-center gap-2.5 p-3">
                      {result.product ? (
                        <>
                          <div className="h-12 w-12 shrink-0 overflow-hidden rounded-sm">
                            <ImageWithSkeleton
                              src={result.product.image_url}
                              alt={result.product.name}
                              fixedContainer
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="mb-0.5 text-xs text-muted-foreground">Product</p>
                            <p className="truncate text-xs font-medium">{result.product.name}</p>
                          </div>
                        </>
                      ) : (
                        <p className="text-xs text-muted-foreground">Product deleted</p>
                      )}
                    </div>
                  </Wrapper>
                )
              })()}

              <div className="flex flex-1 flex-col space-y-3 p-3">
                <div className="flex items-center justify-between gap-3">
                  <span className={`inline-flex h-6 items-center gap-1.5 rounded-md px-2 text-xs font-medium ${statusTone(result.status)}`}>
                    <StatusIcon status={result.status} />
                    {statusLabel(result.status)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {PRODUCT_IMAGE_SIZE_MAP[result.image_size] ?? result.image_size} · {result.image_quality}
                  </span>
                </div>

                {result.template && (
                  <p className="text-xs text-muted-foreground">
                    {PRODUCT_TEMPLATE_CATEGORY_LABELS[result.template.category]}
                  </p>
                )}

                <p className="line-clamp-3 text-xs leading-5 text-muted-foreground">
                  {result.final_prompt}
                </p>

                {(result.status === 'queued' || result.status === 'processing') && (
                  <div className="space-y-2 rounded-md border border-border bg-muted/30 p-2">
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <div className="h-full w-1/2 animate-[product-progress_1.2s_ease-in-out_infinite] rounded-full bg-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {result.status === 'queued' ? 'Waiting to start...' : 'Generating image...'}
                    </p>
                  </div>
                )}

                {result.status === 'failed' && result.error_message && (
                  <p className="rounded-md border border-red-500/20 bg-red-500/10 px-2 py-1.5 text-xs leading-5 text-red-600 dark:text-red-400">
                    {result.error_message}
                  </p>
                )}

                <div className="mt-auto flex justify-end gap-1 border-t border-border pt-3">
                  {result.status === 'completed' && result.image_url && (
                    <>
                      <a
                        href={`/api/product-results/download?id=${result.id}`}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Download className="h-3.5 w-3.5" />
                        JPG
                      </a>
                      <button
                        type="button"
                        onClick={() => openVariationPrompt(result)}
                        className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <Sparkles className="h-3.5 w-3.5" />
                        New variation
                      </button>
                    </>
                  )}
                  {(result.status === 'pending' || result.status === 'failed') && (
                    <button
                      type="button"
                      onClick={() => openGeneratePrompt(result)}
                      disabled={usageLimitReached || deletingId === result.id}
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {result.status === 'failed' ? <RotateCcw className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                      {result.status === 'failed' ? 'Retry' : 'Generate'}
                    </button>
                  )}
                  <ConfirmDialog
                    title={result.status === 'pending' ? 'Cancel draft' : 'Delete result'}
                    description={
                      result.status === 'pending'
                        ? 'This pending product photo draft will be permanently deleted.'
                        : 'This product photo result will be permanently deleted.'
                    }
                    onConfirm={() => handleDelete(result)}
                    confirmLabel={result.status === 'pending' ? 'Cancel draft' : 'Delete'}
                    variant={result.status === 'pending' ? 'warning' : 'danger'}
                  >
                    <button
                      type="button"
                      disabled={deletingId === result.id}
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-red-500 disabled:opacity-50"
                    >
                      {deletingId === result.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                      {result.status === 'pending' ? 'Cancel' : 'Delete'}
                    </button>
                  </ConfirmDialog>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {visibleCount < filtered.length && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
            className="rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            Load {Math.min(PAGE_SIZE, filtered.length - visibleCount)} more
          </button>
        </div>
      )}

      {filtered.length === 0 && (
        <p className="py-12 text-center text-sm text-muted-foreground">No results match this filter.</p>
      )}

      {lightboxResult && <ResultLightbox result={lightboxResult} onClose={() => setLightboxResult(null)} />}
      {showUpgrade && <UpgradeDialog onClose={() => setShowUpgrade(false)} />}

      {promptModal && (
        <PromptEditModal
          result={promptModal.result}
          mode={promptModal.mode}
          text={promptModal.text}
          imageSize={promptModal.imageSize}
          imageQuality={promptModal.imageQuality}
          onChange={(text) => setPromptModal((pm) => pm ? { ...pm, text } : pm)}
          onSizeChange={(imageSize) => setPromptModal((pm) => pm ? { ...pm, imageSize } : pm)}
          onQualityChange={(imageQuality) => setPromptModal((pm) => pm ? { ...pm, imageQuality } : pm)}
          onConfirm={handleConfirmModal}
          onClose={() => !modalLoading && setPromptModal(null)}
          loading={modalLoading}
          usage={usage}
        />
      )}
    </>
  )
}
