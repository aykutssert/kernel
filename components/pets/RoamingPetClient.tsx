'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { usePathname } from 'next/navigation'

const FPS = 8
const SCALE = 0.5 // scale down so it fits nicely
const VISIBLE_WIDTH = Math.round(CELL_WIDTH * SCALE)
const VISIBLE_HEIGHT = Math.round(CELL_HEIGHT * SCALE)

export function RoamingPetClient({ spritesheetUrl }: { spritesheetUrl: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  const posRef = useRef({ x: Math.random() * 500, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef<(typeof CODEX_PET_STATES)[number]>(CODEX_PET_STATES.find(s => s.name === 'idle')!)
  const stateTimerRef = useRef(0)
  const frameRef = useRef(0)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  const isHoveredRef = useRef(false)

  // Don't show in admin to avoid distractions
  if (pathname?.startsWith('/admin')) return null

  useEffect(() => {
    if (!spritesheetUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spritesheetUrl
    img.onload = () => { imgRef.current = img; setLoaded(true) }
    return () => { img.onload = null }
  }, [spritesheetUrl])

  useEffect(() => {
    if (!loaded || !spritesheetUrl) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Position at bottom initially
    posRef.current.y = window.innerHeight - VISIBLE_HEIGHT

    function changeState(newStateName: string) {
      if (stateRef.current.name === newStateName) return
      const st = CODEX_PET_STATES.find(s => s.name === newStateName)
      if (st) {
        stateRef.current = st
        frameRef.current = 0
      }
    }

    function draw(time: number) {
      // 1. PHYSICS LOOP (Runs every frame for smooth 60fps movement)
      
      if (isHoveredRef.current) {
        // If hovered, stop moving and wave
        velRef.current.x = 0
        changeState('waving')
        // Still apply gravity if it was jumped
        if (posRef.current.y < window.innerHeight - VISIBLE_HEIGHT) {
           velRef.current.y += 0.8
        } else {
           velRef.current.y = 0
           posRef.current.y = window.innerHeight - VISIBLE_HEIGHT
        }
      } else {
        // Simple AI logic timer based on actual frames (approx 60fps)
        stateTimerRef.current++
        if (stateTimerRef.current > 60 * (2 + Math.random() * 3)) { // change every 2-5 seconds
          stateTimerRef.current = 0
          const rand = Math.random()
          // Only jump if we are on the ground
          if (rand < 0.25 && posRef.current.y >= window.innerHeight - VISIBLE_HEIGHT) {
            changeState('jumping')
            velRef.current.y = -16 // Faster initial jump velocity
            velRef.current.x = Math.random() > 0.5 ? 5.0 : -5.0
          } else if (rand < 0.4) {
             changeState('idle')
             velRef.current.x = 0
          } else if (rand < 0.7) {
             changeState('running-right')
             velRef.current.x = 5.0 // Increased run speed significantly
          } else {
             changeState('running-left')
             velRef.current.x = -5.0
          }
        }

        // Apply Gravity if jumping or in air
        if (posRef.current.y < window.innerHeight - VISIBLE_HEIGHT || velRef.current.y < 0) {
           velRef.current.y += 0.8 // Faster gravity snap
        } else {
           velRef.current.y = 0
           posRef.current.y = window.innerHeight - VISIBLE_HEIGHT
           // If we landed from a jump, go back to idle or running
           if (stateRef.current.name === 'jumping') {
              changeState('idle')
              velRef.current.x = 0
           }
        }
      }
      
      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y

      // Floor collision (ensure it doesn't fall below screen)
      if (posRef.current.y > window.innerHeight - VISIBLE_HEIGHT) {
         posRef.current.y = window.innerHeight - VISIBLE_HEIGHT
      }

      // Screen bounds X
      if (posRef.current.x <= 0) {
        posRef.current.x = 0
        changeState('running-right')
        velRef.current.x = 5.0
        stateTimerRef.current = 0
      } else if (posRef.current.x + VISIBLE_WIDTH >= window.innerWidth) {
        posRef.current.x = window.innerWidth - VISIBLE_WIDTH
        changeState('running-left')
        velRef.current.x = -5.0
        stateTimerRef.current = 0
      }

      // 2. RENDER LOOP (Updates canvas at 60fps, but changes sprite frame at 8fps)
      ctx!.clearRect(0, 0, CELL_WIDTH, CELL_HEIGHT)
      ctx!.drawImage(
        imgRef.current!,
        frameRef.current * CELL_WIDTH,
        stateRef.current.row * CELL_HEIGHT,
        CELL_WIDTH, CELL_HEIGHT,
        0, 0,
        CELL_WIDTH, CELL_HEIGHT
      )
      canvas.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`

      // Only increment the sprite frame every (1000 / FPS) milliseconds
      if (time - lastTimeRef.current >= 1000 / FPS) {
        lastTimeRef.current = time
        frameRef.current = (frameRef.current + 1) % stateRef.current.frames
      }

      rafRef.current = requestAnimationFrame(draw)
    }

    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [loaded, spritesheetUrl])

  if (!spritesheetUrl) return null

  return (
    <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
      <canvas
        ref={canvasRef}
        width={CELL_WIDTH}
        height={CELL_HEIGHT}
        className="absolute top-0 left-0 pointer-events-auto cursor-pointer"
        onMouseEnter={() => { isHoveredRef.current = true }}
        onMouseLeave={() => { isHoveredRef.current = false }}
        style={{
          width: VISIBLE_WIDTH,
          height: VISIBLE_HEIGHT,
          imageRendering: 'pixelated',
          willChange: 'transform'
        }}
      />
    </div>
  )
}
