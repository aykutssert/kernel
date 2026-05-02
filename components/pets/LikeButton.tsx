'use client'

import { useEffect, useState, useCallback } from 'react'
import { Heart } from 'lucide-react'
import { cn } from '@/lib/utils'

function getFingerprint(): string {
  const key = 'codex_fp'
  let fp = localStorage.getItem(key)
  if (!fp) {
    fp = crypto.randomUUID()
    localStorage.setItem(key, fp)
  }
  return fp
}

interface LikeButtonProps {
  petId: string
  initialCount?: number
  compact?: boolean
  showCount?: boolean
}

export function LikeButton({ petId, initialCount = 0, compact = false, showCount = false }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const fp = getFingerprint()
    fetch(`/api/pets/like?id=${petId}&fp=${fp}`)
      .then((r) => r.json())
      .then(({ liked, count }) => {
        setLiked(liked)
        setCount(count)
        setReady(true)
      })
      .catch(() => setReady(true))
  }, [petId])

  const toggle = useCallback(async () => {
    if (loading) return
    setLoading(true)
    const fp = getFingerprint()
    try {
      const res = await fetch('/api/pets/like', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: petId, fingerprint: fp }),
      })
      if (res.ok) {
        const data = await res.json()
        setLiked(data.liked)
        setCount(data.count)
      }
    } finally {
      setLoading(false)
    }
  }, [petId, loading])

  return (
    <div className="inline-flex items-center gap-2">
      <button
        onClick={toggle}
        disabled={!ready || loading}
        aria-label={liked ? 'Unlike' : 'Like'}
        className={cn(
          'inline-flex items-center justify-center rounded-lg border transition-colors',
          compact
            ? 'px-2.5 py-1.5'
            : 'px-4 py-2.5',
          liked
            ? 'border-rose-500/60 text-rose-500 bg-rose-500/10 hover:bg-rose-500/15'
            : 'border-foreground/15 text-muted-foreground hover:text-foreground hover:border-foreground/40',
          (!ready || loading) && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Heart className={cn('transition-all', compact ? 'w-3.5 h-3.5' : 'w-4 h-4', liked && 'fill-rose-500')} />
      </button>
      {showCount && count > 0 && (
        <span className="text-sm text-muted-foreground tabular-nums">{count.toLocaleString()}</span>
      )}
    </div>
  )
}
