'use client'

import { useCallback, useState } from 'react'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type PromptLikeButtonProps = {
  docId: string
  initialCount?: number | null
  initialLiked?: boolean
  showCount?: boolean
  compact?: boolean
  onChange?: (liked: boolean, count: number) => void
}

export function PromptLikeButton({
  docId,
  initialCount = 0,
  initialLiked = false,
  showCount = true,
  compact = false,
  onChange,
}: PromptLikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount ?? 0)
  const [loading, setLoading] = useState(false)

  const toggle = useCallback(async () => {
    if (loading) return

    setLoading(true)
    try {
      const response = await fetch('/api/docs/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: docId }),
      })

      if (response.status === 401) {
        window.dispatchEvent(new CustomEvent('kernel-auth-open'))
        toast.message('Sign in to like prompts.')
        return
      }

      if (response.ok) {
        const data = await response.json()
        setLiked(Boolean(data.liked))
        setCount(data.count ?? 0)
        onChange?.(Boolean(data.liked), data.count ?? 0)
      }
    } finally {
      setLoading(false)
    }
  }, [docId, loading, onChange])

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={loading}
      aria-label={liked ? 'Unlike prompt' : 'Like prompt'}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border transition-colors',
        compact ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm',
        liked
          ? 'border-rose-500/60 bg-rose-500/10 text-rose-500 hover:bg-rose-500/15'
          : 'border-foreground/15 text-muted-foreground hover:border-foreground/40 hover:text-foreground',
        loading && 'cursor-not-allowed opacity-50'
      )}
    >
      <Heart className={cn(compact ? 'h-3.5 w-3.5' : 'h-3.5 w-3.5', liked && 'fill-rose-500')} />
      {showCount && count > 0 && <span className="tabular-nums">{count.toLocaleString()}</span>}
    </button>
  )
}
