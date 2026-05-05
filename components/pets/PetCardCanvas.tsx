'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'

const FPS = 8

interface PetCardCanvasProps {
  spritesheetUrl: string
  size?: number
  active?: boolean
}

export function PetCardCanvas({ spritesheetUrl, size = 140, active = false }: PetCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const [focused, setFocused] = useState(false)

  const stateIndexRef = useRef(0)
  const frameRef = useRef(0)
  const lastTimeRef = useRef(0)
  const rafRef = useRef<number>(0)

  function drawFrame() {
    const canvas = canvasRef.current
    const img = imgRef.current
    if (!canvas || !img) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const state = CODEX_PET_STATES[stateIndexRef.current]
    ctx.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
    ctx.drawImage(
      img,
      frameRef.current * CELL_WIDTH,
      state.row * CELL_HEIGHT,
      CELL_WIDTH, CELL_HEIGHT,
      0, 0,
      CELL_WIDTH, CELL_HEIGHT
    )
  }

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spritesheetUrl
    img.onload = () => { imgRef.current = img; setLoaded(true) }
    return () => { img.onload = null }
  }, [spritesheetUrl])

  useEffect(() => {
    if (!loaded) return
    drawFrame()
  }, [loaded])

  useEffect(() => {
    if (!loaded || (!active && !focused)) return

    function draw(time: number) {
      if (time - lastTimeRef.current >= 1000 / FPS) {
        lastTimeRef.current = time
        drawFrame()

        frameRef.current++
        if (frameRef.current >= CODEX_PET_STATES[stateIndexRef.current].frames) {
          frameRef.current = 0
          stateIndexRef.current = (stateIndexRef.current + 1) % CODEX_PET_STATES.length
        }
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [active, focused, loaded])

  const h = Math.round(CELL_HEIGHT * (size / CELL_WIDTH))

  return (
    <div className="flex items-center justify-center w-full py-4 bg-muted/20">
      <div
        style={{
          width: size,
          height: h,
          backgroundImage: 'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%)',
          backgroundSize: '12px 12px',
        }}
      >
        <canvas
          ref={canvasRef}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          tabIndex={0}
          aria-label="Pet preview"
          style={{ imageRendering: 'pixelated', width: size, height: h }}
        />
      </div>
    </div>
  )
}
