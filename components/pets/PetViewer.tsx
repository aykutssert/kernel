'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { cn } from '@/lib/utils'

const FPS = 8

interface PetViewerProps {
  spritesheetUrl: string
  size?: number
}

export function PetViewer({ spritesheetUrl, size = 192 }: PetViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [activeState, setActiveState] = useState(0)
  const [loaded, setLoaded] = useState(false)
  const frameRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spritesheetUrl
    img.onload = () => { imgRef.current = img; setLoaded(true) }
    return () => { img.onload = null }
  }, [spritesheetUrl])

  useEffect(() => {
    if (!loaded) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = CODEX_PET_STATES[activeState]
    frameRef.current = 0

    function draw(time: number) {
      if (time - lastTimeRef.current >= 1000 / FPS) {
        lastTimeRef.current = time
        const img = imgRef.current!
        ctx!.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
        ctx!.drawImage(
          img,
          frameRef.current * CELL_WIDTH,
          state.row * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT,
          0, 0,
          CELL_WIDTH,
          CELL_HEIGHT
        )
        frameRef.current = (frameRef.current + 1) % state.frames
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, activeState])

  const scale = size / CELL_WIDTH

  return (
    <div className="flex flex-col items-center gap-6">
      <div
        className="rounded-xl border border-border flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: Math.round(CELL_HEIGHT * scale),
          backgroundImage: 'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%)',
          backgroundSize: '16px 16px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          style={{ imageRendering: 'pixelated', width: size, height: Math.round(CELL_HEIGHT * scale) }}
        />
      </div>

      <div className="grid grid-cols-3 gap-2 w-full max-w-sm">
        {CODEX_PET_STATES.map((s, i) => (
          <button
            key={s.name}
            onClick={() => setActiveState(i)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-medium transition-colors',
              activeState === i
                ? 'bg-foreground text-background'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  )
}
