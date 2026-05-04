'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { usePathname } from 'next/navigation'

const FPS = 8
const SCALE = 0.5
const VISIBLE_WIDTH = Math.round(CELL_WIDTH * SCALE)
const VISIBLE_HEIGHT = Math.round(CELL_HEIGHT * SCALE)

export function RoamingPetClient({ spritesheetUrl }: { spritesheetUrl: string | null }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()

  const posRef = useRef({ x: Math.random() * 300, y: 0 })
  const velRef = useRef({ x: 0, y: 0 })
  const stateRef = useRef<(typeof CODEX_PET_STATES)[number]>(CODEX_PET_STATES.find(s => s.name === 'idle')!)
  const stateTimerRef = useRef(0)
  const frameRef = useRef(0)
  const rafRef = useRef(0)
  const lastTimeRef = useRef(0)
  
  const isHoveredRef = useRef(false)
  const isDraggingRef = useRef(false)
  const dragVelocityRef = useRef({ x: 0, y: 0 })
  const lastPointerPosRef = useRef({ x: 0, y: 0 })

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
    function handlePointerMove(e: PointerEvent) {
      if (!isDraggingRef.current) return
      
      const dx = e.clientX - lastPointerPosRef.current.x
      const dy = e.clientY - lastPointerPosRef.current.y
      
      posRef.current.x += dx
      posRef.current.y += dy
      
      // Clamp bounds immediately while dragging
      if (posRef.current.x < 0) posRef.current.x = 0
      if (posRef.current.x > window.innerWidth - VISIBLE_WIDTH) posRef.current.x = window.innerWidth - VISIBLE_WIDTH
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > window.innerHeight - VISIBLE_HEIGHT) posRef.current.y = window.innerHeight - VISIBLE_HEIGHT
      
      // Calculate throw velocity based on drag speed
      dragVelocityRef.current.x = dx * 0.8
      dragVelocityRef.current.y = dy * 0.8

      lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
    }

    function handlePointerUp() {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        // Apply the throw!
        velRef.current.x = dragVelocityRef.current.x
        velRef.current.y = dragVelocityRef.current.y
        isHoveredRef.current = false
        stateTimerRef.current = 0 // reset AI timer
      }
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
    }
  }, [])

  useEffect(() => {
    if (!loaded || !spritesheetUrl) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

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
      const isMobile = window.innerWidth < 768
      const speedMult = isMobile ? 0.5 : 1.0

      if (isDraggingRef.current) {
        // User is holding the pet
        changeState('waiting') // acts like it's dangling
        velRef.current.x = 0
        velRef.current.y = 0
      } 
      else if (posRef.current.y < window.innerHeight - VISIBLE_HEIGHT || Math.abs(velRef.current.y) > 0.1 || Math.abs(velRef.current.x) > 5) {
        // IN THE AIR or Thrown fast
        velRef.current.y += 0.8 * speedMult // Gravity
        
        // Wall Bounce while flying (Predictive)
        if (posRef.current.x + velRef.current.x <= 0) {
          posRef.current.x = 0
          velRef.current.x *= -0.7
          changeState('running-right')
        } else if (posRef.current.x + velRef.current.x + VISIBLE_WIDTH >= window.innerWidth) {
          posRef.current.x = window.innerWidth - VISIBLE_WIDTH
          velRef.current.x *= -0.7
          changeState('running-left')
        }

        // Ceiling Bounce while flying (Predictive)
        if (posRef.current.y + velRef.current.y <= 0) {
          posRef.current.y = 0
          velRef.current.y = Math.abs(velRef.current.y * 0.5) // Force it to go down
        }

        // Floor collision and bounce (Predictive)
        if (posRef.current.y + velRef.current.y >= window.innerHeight - VISIBLE_HEIGHT) {
           posRef.current.y = window.innerHeight - VISIBLE_HEIGHT
           if (velRef.current.y > 6) {
             // Bounce up
             velRef.current.y *= -0.4
             velRef.current.x *= 0.8 // friction on hit
             changeState('jumping')
           } else {
             // Settle on ground
             velRef.current.y = 0
             velRef.current.x = 0
             changeState('idle')
           }
        } else {
           // Free falling / flying animation
           changeState('jumping')
        }
      } 
      else if (isHoveredRef.current) {
        // Hovering on ground
        velRef.current.x = 0
        changeState('waving')
      } 
      else {
        // AI Logic on ground
        stateTimerRef.current++
        if (stateTimerRef.current > 60 * (2 + Math.random() * 3)) {
          stateTimerRef.current = 0
          const rand = Math.random()
          if (rand < 0.25) {
            changeState('jumping')
            velRef.current.y = -16 * speedMult
            velRef.current.x = (Math.random() > 0.5 ? 5.0 : -5.0) * speedMult
          } else if (rand < 0.4) {
             changeState('idle')
             velRef.current.x = 0
          } else if (rand < 0.7) {
             changeState('running-right')
             velRef.current.x = 5.0 * speedMult
          } else {
             changeState('running-left')
             velRef.current.x = -5.0 * speedMult
          }
        }
        
        // Ground wall bounds
        if (posRef.current.x <= 0) {
          posRef.current.x = 0
          changeState('running-right')
          velRef.current.x = 5.0 * speedMult
          stateTimerRef.current = 0
        } else if (posRef.current.x + VISIBLE_WIDTH >= window.innerWidth) {
          posRef.current.x = window.innerWidth - VISIBLE_WIDTH
          changeState('running-left')
          velRef.current.x = -5.0 * speedMult
          stateTimerRef.current = 0
        }
      }
      
      // Apply velocities
      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y

      // Force bounds to prevent pet from disappearing completely
      if (posRef.current.x < 0) posRef.current.x = 0
      if (posRef.current.x > window.innerWidth - VISIBLE_WIDTH) posRef.current.x = window.innerWidth - VISIBLE_WIDTH
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > window.innerHeight - VISIBLE_HEIGHT) posRef.current.y = window.innerHeight - VISIBLE_HEIGHT

      // Render Loop
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

      // Sprite frame update at 8fps
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
        className="absolute top-0 left-0 pointer-events-auto cursor-grab active:cursor-grabbing"
        onMouseEnter={() => { if (!isDraggingRef.current) isHoveredRef.current = true }}
        onMouseLeave={() => { isHoveredRef.current = false }}
        onPointerDown={(e) => {
          isDraggingRef.current = true
          isHoveredRef.current = false
          lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
          // Prevent browser drag behavior
          e.currentTarget.setPointerCapture(e.pointerId)
        }}
        style={{
          width: VISIBLE_WIDTH,
          height: VISIBLE_HEIGHT,
          imageRendering: 'pixelated',
          willChange: 'transform',
          touchAction: 'none' // Prevent scrolling on mobile while dragging
        }}
      />
    </div>
  )
}
