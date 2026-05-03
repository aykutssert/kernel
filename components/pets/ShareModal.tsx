'use client'

import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, Copy, X } from 'lucide-react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'

const FPS = 8
const ATLAS_COLS = 8
const SPRITE_SIZE = 164

function SpriteCanvas({ spritesheetUrl }: { spritesheetUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const frameRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spritesheetUrl
    img.onload = () => {
      imgRef.current = img
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext('2d')
      if (!ctx) return
      const state = CODEX_PET_STATES[0]

      function draw(time: number) {
        if (time - lastTimeRef.current >= 1000 / FPS) {
          lastTimeRef.current = time
          ctx!.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
          ctx!.drawImage(imgRef.current!, frameRef.current * CELL_WIDTH, state.row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT, 0, 0, CELL_WIDTH, CELL_HEIGHT)
          frameRef.current = (frameRef.current + 1) % state.frames
        }
        rafRef.current = requestAnimationFrame(draw)
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    return () => {
      img.onload = null
      cancelAnimationFrame(rafRef.current)
    }
  }, [spritesheetUrl])

  const scale = SPRITE_SIZE / CELL_WIDTH

  return (
    <canvas
      ref={canvasRef}
      width={CELL_WIDTH}
      height={CELL_HEIGHT}
      style={{
        imageRendering: 'pixelated',
        width: SPRITE_SIZE,
        height: Math.round(CELL_HEIGHT * scale),
      }}
    />
  )
}

interface Props {
  petId: string
  petName: string
  description: string | null
  spritesheetUrl: string
  onClose: () => void
}

function ShareModalContent({ petId, petName, description, spritesheetUrl, onClose }: Props) {
  const [copied, setCopied] = useState(false)
  const url = `${window.location.origin}/pets/${petId}`

  function handleCopy() {
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function handleShareX() {
    const text = `Check out ${petName} — a Codex Pet`
    window.open(`https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank')
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const spriteH = Math.round(CELL_HEIGHT * (SPRITE_SIZE / CELL_WIDTH))

  return (
    <>
      {/* Backdrop + centering wrapper — click outside to close */}
      <div className="fixed inset-0 z-[200] bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
        <div className="w-full max-w-lg bg-background border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <span className="text-sm font-semibold">Share</span>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-5 flex flex-col gap-4">
            {/* Card preview */}
            <div
              className="w-full rounded-xl overflow-hidden relative"
              style={{
                backgroundImage: 'repeating-conic-gradient(#e0e0e0 0% 25%, #f5f5f5 0% 50%)',
                backgroundSize: '16px 16px',
                minHeight: spriteH + 48,
              }}
            >
              <div className="flex items-end justify-between p-5 h-full">
                <div className="flex flex-col gap-1 flex-1 min-w-0 pr-4">
                  <span className="text-[11px] font-bold text-black/50 uppercase tracking-widest">Codex Pets</span>
                  <p className="text-2xl font-black text-black leading-tight">{petName}</p>
                  {description && (
                    <p className="text-sm text-black/60 line-clamp-2 leading-snug mt-1">{description}</p>
                  )}
                  <span className="mt-3 self-start text-[11px] font-bold font-mono border-2 border-black/80 text-black/80 px-2 py-0.5 rounded">
                    kernel-indol.vercel.app
                  </span>
                </div>
                <div className="shrink-0">
                  <SpriteCanvas spritesheetUrl={spritesheetUrl} />
                </div>
              </div>
            </div>

            {/* Share on X */}
            <button
              onClick={handleShareX}
              className="w-full flex items-center justify-center gap-2 bg-foreground text-background rounded-xl py-3 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              Share on X
            </button>

            {/* Copy link */}
            <div className="flex items-center gap-3 bg-muted/50 border border-border rounded-xl px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-muted-foreground mb-0.5">Link</p>
                <p className="text-xs font-mono truncate">{url}</p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 flex items-center gap-1.5 text-xs font-medium border border-border bg-background rounded-lg px-3 py-1.5 hover:bg-muted transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}


export function ShareButton({ petId, petName, description, spritesheetUrl }: Omit<Props, 'onClose'>) {
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 px-3 py-2 border border-foreground/15 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:border-foreground/40 transition-colors"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.748l7.73-8.835L1.254 2.25H8.08l4.253 5.622zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
        Share
      </button>
      {mounted && open && createPortal(
        <ShareModalContent
          petId={petId}
          petName={petName}
          description={description}
          spritesheetUrl={spritesheetUrl}
          onClose={() => setOpen(false)}
        />,
        document.body
      )}
    </>
  )
}
