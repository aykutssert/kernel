'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { usePathname } from 'next/navigation'

const FPS = 8

export function RoamingPetClient({ spritesheetUrl }: { spritesheetUrl: string | null }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const [isMobileState, setIsMobileState] = useState(false)

  useEffect(() => {
    setIsMobileState(window.innerWidth < 768)
    const handleResize = () => setIsMobileState(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const currentScale = isMobileState ? 0.35 : 0.5
  const visibleWidth = Math.round(CELL_WIDTH * currentScale)
  const visibleHeight = Math.round(CELL_HEIGHT * currentScale)

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
  const dragDistanceRef = useRef(0)
  const wasThrownRef = useRef(false)
  const forceWaveUntilRef = useRef(0)
  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const lastActivityTimeRef = useRef(Date.now())

  const foodRef = useRef<{ x: number, y: number, velY: number } | null>(null)
  const foodElementRef = useRef<HTMLDivElement>(null)

  const showSpeech = (phrases: string[], durationMs?: number) => {
    if (!bubbleRef.current) return
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
    bubbleRef.current.textContent = phrases[Math.floor(Math.random() * phrases.length)]
    bubbleRef.current.style.opacity = '1'
    if (durationMs) {
      bubbleTimeoutRef.current = setTimeout(() => hideSpeech(), durationMs)
    }
  }

  const hideSpeech = () => {
    if (bubbleTimeoutRef.current) {
      clearTimeout(bubbleTimeoutRef.current)
      bubbleTimeoutRef.current = null
    }
    if (bubbleRef.current) bubbleRef.current.style.opacity = '0'
  }

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
      lastActivityTimeRef.current = Date.now()
      if (!isDraggingRef.current) return

      const dx = e.clientX - lastPointerPosRef.current.x
      const dy = e.clientY - lastPointerPosRef.current.y

      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy)

      posRef.current.x += dx
      posRef.current.y += dy

      // Clamp bounds immediately while dragging
      const currentVisibleWidth = Math.round(CELL_WIDTH * (window.innerWidth < 768 ? 0.35 : 0.5))
      const currentVisibleHeight = Math.round(CELL_HEIGHT * (window.innerWidth < 768 ? 0.35 : 0.5))
      if (posRef.current.x < 0) posRef.current.x = 0
      if (posRef.current.x > window.innerWidth - currentVisibleWidth) posRef.current.x = window.innerWidth - currentVisibleWidth
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > window.innerHeight - currentVisibleHeight) posRef.current.y = window.innerHeight - currentVisibleHeight

      // Calculate throw velocity based on drag speed (slightly slower overall)
      dragVelocityRef.current.x = dx * 0.5
      dragVelocityRef.current.y = dy * 0.5

      lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
    }

    function handlePointerUp() {
      if (isDraggingRef.current) {
        isDraggingRef.current = false
        isHoveredRef.current = false
        stateTimerRef.current = 0 // reset AI timer

        if (dragDistanceRef.current < 10) {
          // It was just a click!
          forceWaveUntilRef.current = Date.now() + 2000
          showSpeech([
            "Hi there!",
            "Hello!",
            "Nice to see you!",
            "Teehee!",
          ], 2000)
        } else {
          // Apply the throw!
          velRef.current.x = dragVelocityRef.current.x
          velRef.current.y = dragVelocityRef.current.y
          wasThrownRef.current = true
        }
      }
    }

    function handleKeyDown() {
      lastActivityTimeRef.current = Date.now()
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    if (!loaded || !spritesheetUrl) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentVisibleHeight = Math.round(CELL_HEIGHT * (window.innerWidth < 768 ? 0.35 : 0.5))
    posRef.current.y = window.innerHeight - currentVisibleHeight

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
      const speedMult = isMobile ? 0.2 : 0.4
      const currentVisibleWidth = Math.round(CELL_WIDTH * (isMobile ? 0.35 : 0.5))
      const currentVisibleHeight = Math.round(CELL_HEIGHT * (isMobile ? 0.35 : 0.5))

      if (isDraggingRef.current) {
        // User is holding the pet
        changeState('waiting') // acts like it's dangling
        velRef.current.x = 0
        velRef.current.y = 0
      }
      else if (posRef.current.y < window.innerHeight - currentVisibleHeight || Math.abs(velRef.current.y) > 0.1 || Math.abs(velRef.current.x) > 10) {
        // IN THE AIR or Thrown fast
        velRef.current.y += 0.8 * speedMult // Gravity

        // Wall Bounce while flying (Predictive)
        if (posRef.current.x + velRef.current.x <= 0) {
          posRef.current.x = 0
          velRef.current.x *= -0.7
          changeState('running-right')
        } else if (posRef.current.x + velRef.current.x + currentVisibleWidth >= window.innerWidth) {
          posRef.current.x = window.innerWidth - currentVisibleWidth
          velRef.current.x *= -0.7
          changeState('running-left')
        }

        // Ceiling Bounce while flying (Predictive)
        if (posRef.current.y + velRef.current.y <= 0) {
          posRef.current.y = 0
          velRef.current.y = Math.abs(velRef.current.y * 0.5) // Force it to go down
        }

        // Floor collision and bounce (Predictive)
        if (posRef.current.y + velRef.current.y >= window.innerHeight - currentVisibleHeight) {
          posRef.current.y = window.innerHeight - currentVisibleHeight
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

            // Complain if dropped
            if (wasThrownRef.current) {
              wasThrownRef.current = false
              showSpeech([
                "Ouch!",
                "Hey, watch it!",
                "That hurt!",
                "Don't throw me!",
                "Are you crazy?!",
                "My head...",
                "Why did you do that?"
              ], 3000)
            }
          }
        } else {
          // Free falling / flying animation
          changeState('jumping')
        }
      }
      else if (isHoveredRef.current || Date.now() < forceWaveUntilRef.current) {
        // Hovering or clicked on ground
        velRef.current.x = 0
        changeState('waving')
      }
      else {
        // AI Logic on ground
        const isAfk = (Date.now() - lastActivityTimeRef.current) > 30000 // 30 seconds

        if (isAfk) {
          if (stateRef.current.name !== 'failed') {
            changeState('failed')
            velRef.current.x = 0
            showSpeech(["Zzz..."]) // Stay asleep
          }
        } else if (foodRef.current) {
          // FOOD CHASE LOGIC
          const dist = foodRef.current.x - (posRef.current.x + currentVisibleWidth / 2)

          if (Math.abs(dist) > 20) {
            if (dist > 0) {
              changeState('running-right')
              velRef.current.x = 7.0 * speedMult // Run slightly faster for food
            } else {
              changeState('running-left')
              velRef.current.x = -7.0 * speedMult
            }
          } else {
            velRef.current.x = 0
            changeState('idle')
            // Eat it if it's on the ground
            if (foodRef.current.y >= window.innerHeight - 50) {
              foodRef.current = null
              showSpeech(["Yummy!", "🍎❤️", "Delicious!"], 3000)
              velRef.current.y = -8 * speedMult // Happy jump
              changeState('jumping')
            }
          }
          stateTimerRef.current = 0 // Keep timer reset while chasing
        } else {
          // Normal AI Logic
          stateTimerRef.current++
          if (stateTimerRef.current > 60 * (2 + Math.random() * 3)) { // change every 2-5 seconds
            stateTimerRef.current = 0
            const rand = Math.random()
            // 15% chance to jump
            if (rand < 0.15) {
              changeState('jumping')
              velRef.current.y = -16 * speedMult
              velRef.current.x = (Math.random() > 0.5 ? 5.0 : -5.0) * speedMult
              hideSpeech()
            }
            // 35% chance to idle
            else if (rand < 0.5) {
              changeState('idle')
              velRef.current.x = 0

              // 100% chance to speak when idling
              showSpeech([
                "What a cool page!",
                "Try dragging me!",
                "I'm generated by Codex.",
                "Need a code review?",
                "It's so quiet here...",
                "Click me!",
                "Are you writing code?",
                "Bloop."
              ], 3000)
            }
            // 30% chance to run right
            else if (rand < 0.7) {
              changeState('running-right')
              velRef.current.x = 5.0 * speedMult
              hideSpeech()
            }
            // 30% chance to run left
            else {
              changeState('running-left')
              velRef.current.x = -5.0 * speedMult
              hideSpeech()
            }
          }

          // Ground wall bounds
          if (posRef.current.x <= 0) {
            posRef.current.x = 0
            changeState('running-right')
            velRef.current.x = 5.0 * speedMult
            stateTimerRef.current = 0
          } else if (posRef.current.x + currentVisibleWidth >= window.innerWidth) {
            posRef.current.x = window.innerWidth - currentVisibleWidth
            changeState('running-left')
            velRef.current.x = -5.0 * speedMult
            stateTimerRef.current = 0
          }
        }
      }

      // Apply velocities
      posRef.current.x += velRef.current.x
      posRef.current.y += velRef.current.y

      // Force bounds to prevent pet from disappearing completely
      if (posRef.current.x < 0) posRef.current.x = 0
      if (posRef.current.x > window.innerWidth - currentVisibleWidth) posRef.current.x = window.innerWidth - currentVisibleWidth
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > window.innerHeight - currentVisibleHeight) posRef.current.y = window.innerHeight - currentVisibleHeight

      // FOOD PHYSICS
      if (foodRef.current) {
        foodRef.current.velY += 0.8 * speedMult // Gravity for food
        foodRef.current.y += foodRef.current.velY

        // Floor collision for food
        if (foodRef.current.y > window.innerHeight - 30) {
          foodRef.current.y = window.innerHeight - 30
          if (foodRef.current.velY > 3) {
            foodRef.current.velY *= -0.4 // bounce
          } else {
            foodRef.current.velY = 0 // settle
          }
        }

        if (foodElementRef.current) {
          foodElementRef.current.style.transform = `translate(${foodRef.current.x}px, ${foodRef.current.y}px)`
          foodElementRef.current.style.opacity = '1'
        }
      } else if (foodElementRef.current) {
        foodElementRef.current.style.opacity = '0'
      }

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
      if (containerRef.current) {
        containerRef.current.style.transform = `translate(${posRef.current.x}px, ${posRef.current.y}px)`
      }

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
      <div
        ref={containerRef}
        className="absolute top-0 left-0"
        style={{
          width: visibleWidth,
          height: visibleHeight,
          willChange: 'transform'
        }}
      >
        <div
          ref={bubbleRef}
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1.5 bg-background border border-border text-foreground rounded-2xl shadow-sm text-[11px] font-medium opacity-0 transition-opacity duration-300 pointer-events-none whitespace-nowrap"
          style={{
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transformOrigin: 'bottom center'
          }}
        />
        <canvas
          ref={canvasRef}
          width={CELL_WIDTH}
          height={CELL_HEIGHT}
          className="w-full h-full pointer-events-auto cursor-grab active:cursor-grabbing"
          onMouseEnter={() => {
            if (!isDraggingRef.current) {
              isHoveredRef.current = true
              showSpeech([
                "Hi there!",
                "Hello!",
                "Hey!",
                "Nice to see you!"
              ]) // No timeout, stays while hovered
            }
          }}
          onMouseLeave={() => {
            isHoveredRef.current = false
            hideSpeech()
          }}
          onPointerDown={(e) => {
            isDraggingRef.current = true
            isHoveredRef.current = false
            dragDistanceRef.current = 0
            lastPointerPosRef.current = { x: e.clientX, y: e.clientY }
            e.currentTarget.setPointerCapture(e.pointerId)
            showSpeech([
              "Whoa!",
              "Put me down!",
              "Let me go!",
              "Hey!",
              "Flying time!"
            ]) // No timeout, stays while grabbed
          }}
          style={{
            imageRendering: 'pixelated',
            touchAction: 'none'
          }}
        />
      </div>

      {/* Food Element */}
      <div
        ref={foodElementRef}
        className="absolute top-0 left-0 text-2xl transition-opacity duration-200"
        style={{ opacity: 0, willChange: 'transform' }}
      >
        🍎
      </div>

      {/* Feed Button */}
      <button
        onClick={() => {
          if (!foodRef.current) {
            foodRef.current = {
              x: Math.max(20, Math.random() * (window.innerWidth - 40)),
              y: -50,
              velY: 0
            }
            hideSpeech() // Hide Zzz if sleeping
            lastActivityTimeRef.current = Date.now() // Wake up
          }
        }}
        className="fixed bottom-4 left-4 z-[10000] bg-background/80 backdrop-blur-sm border border-border px-3 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-muted transition-colors pointer-events-auto flex items-center gap-2"
      >
        <span>🍎</span> <span className="hidden sm:inline">Feed</span>
      </button>
    </div>
  )
}
