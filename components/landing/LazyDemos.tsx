'use client'

import dynamic from 'next/dynamic'

export const KitchenShowcaseLazy = dynamic(
  () => import('./KitchenShowcase').then((m) => m.KitchenShowcase),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-muted-foreground/40">Loading…</span>
      </div>
    ),
  }
)

export const TshirtMiniPreviewLazy = dynamic(
  () => import('./TshirtMiniPreviewWrapper').then((m) => m.TshirtMiniPreviewWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-muted-foreground/40">Loading…</span>
      </div>
    ),
  }
)
