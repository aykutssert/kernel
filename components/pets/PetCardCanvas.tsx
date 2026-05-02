'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'

const FPS = 8
const IDLE = CODEX_PET_STATES[0]

interface PetCardCanvasProps {
  spritesheetUrl: string
  size?: number
}

export function PetCardCanvas({ spritesheetUrl, size = 140 }: PetCardCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
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

    function draw(time: number) {
      if (time - lastTimeRef.current >= 1000 / FPS) {
        lastTimeRef.current = time
        ctx!.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
        ctx!.drawImage(
          imgRef.current!,
          frameRef.current * CELL_WIDTH,
          IDLE.row * CELL_HEIGHT,
          CELL_WIDTH,
          CELL_HEIGHT,
          0, 0,
          CELL_WIDTH,
          CELL_HEIGHT
        )
        frameRef.current = (frameRef.current + 1) % IDLE.frames
      }
      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded])

  const h = Math.round(CELL_HEIGHT * (size / CELL_WIDTH))

  return (
    <div
      className="flex items-center justify-center w-full"
      style={{
        height: h,
        backgroundImage:
          'repeating-conic-gradient(var(--checker-a) 0% 25%, var(--checker-b) 0% 50%)',
        backgroundSize: '16px 16px',
      }}
    >
      <canvas
        ref={canvasRef}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        style={{
          imageRendering: 'pixelated',
          width: size,
          height: h,
        }}
      />
    </div>
  )
}
