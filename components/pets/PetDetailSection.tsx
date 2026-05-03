'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { cn } from '@/lib/utils'

const FPS = 8
const THUMB_SIZE = 80

function StateThumb({
  img,
  state,
  active,
  onClick,
}: {
  img: HTMLImageElement
  state: (typeof CODEX_PET_STATES)[number]
  active: boolean
  onClick: () => void
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const frameRef = useRef(0)
  const rafRef = useRef<number>(0)
  const lastTimeRef = useRef(0)
  const thumbH = Math.round(CELL_HEIGHT * (THUMB_SIZE / CELL_WIDTH))

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    frameRef.current = 0

    function draw(time: number) {
      if (time - lastTimeRef.current >= 1000 / FPS) {
        lastTimeRef.current = time
        ctx!.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
        ctx!.drawImage(img, frameRef.current * CELL_WIDTH, state.row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT, 0, 0, CELL_WIDTH, CELL_HEIGHT)
        frameRef.current = (frameRef.current + 1) % state.frames
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [img, state])

  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1.5 p-2 rounded-xl border transition-colors w-full',
        active
          ? 'border-foreground/40 bg-foreground/5'
          : 'border-foreground/10 hover:border-foreground/25 hover:bg-foreground/5'
      )}
    >
      <div
        className="rounded overflow-hidden"
        style={{
          width: THUMB_SIZE,
          height: thumbH,
          backgroundImage: 'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%)',
          backgroundSize: '8px 8px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          style={{ imageRendering: 'pixelated', width: THUMB_SIZE, height: thumbH }}
        />
      </div>
      <span className="text-xs text-muted-foreground">{state.label}</span>
    </button>
  )
}

export function PetDetailSection({
  spritesheetUrl,
  size = 256,
  children,
}: {
  spritesheetUrl: string
  size?: number
  children: React.ReactNode
}) {
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
        ctx!.drawImage(img, frameRef.current * CELL_WIDTH, state.row * CELL_HEIGHT, CELL_WIDTH, CELL_HEIGHT, 0, 0, CELL_WIDTH, CELL_HEIGHT)
        frameRef.current = (frameRef.current + 1) % state.frames
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, activeState])

  const scale = size / CELL_WIDTH

  return (
    <div className="flex flex-col gap-10">
      {/* Hero row: info left, viewer right */}
      <div className="flex flex-col md:flex-row gap-12 md:items-start">
        <div className="flex-1 min-w-0 w-full overflow-hidden">
          {children}
        </div>
        <div className="shrink-0 flex justify-center md:block">
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
        </div>
      </div>

      {/* Full-width animations grid — single row on desktop */}
      {loaded && imgRef.current && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Animations</p>
          <div className="grid grid-cols-3 gap-2 md:grid-cols-9 md:gap-1">
            {CODEX_PET_STATES.map((s, i) => (
              <StateThumb
                key={s.name}
                img={imgRef.current!}
                state={s}
                active={activeState === i}
                onClick={() => setActiveState(i)}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
