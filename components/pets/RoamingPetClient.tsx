'use client'

import { useEffect, useRef, useState } from 'react'
import { CODEX_PET_STATES, CELL_WIDTH, CELL_HEIGHT } from '@/lib/pets'
import { usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'

const FPS = 8

export function RoamingPetClient({ spritesheetUrl }: { spritesheetUrl: string | null }) {
  const tPet = useTranslations('pet')
  const clickPhrases = tPet.raw('click') as string[]
  const hoverPhrases = tPet.raw('hover') as string[]
  const grabbedPhrases = tPet.raw('grabbed') as string[]
  const thrownPhrases = tPet.raw('thrown') as string[]
  const idlePhrases = tPet.raw('idle') as string[]
  const foodPhrases = tPet.raw('food') as string[]
  const typingIdlePhrase = tPet('typing_idle')
  const typingSlowPhrase = tPet('typing_slow')
  const typingCommentPhrases = tPet.raw('typing_comments') as string[]
  const readingPhrases = tPet.raw('reading') as string[]
  const feedLabel = tPet('feed')

  const containerRef = useRef<HTMLDivElement>(null)
  const bubbleRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)
  const [loaded, setLoaded] = useState(false)
  const pathname = usePathname()
  const [isMobileState, setIsMobileState] = useState(false)
  const [pageVisible, setPageVisible] = useState(true)
  const windowSizeRef = useRef({ width: 1000, height: 1000 })
  const isMobileRef = useRef(false)
  const hiddenInAdmin = pathname?.startsWith('/admin')

  useEffect(() => {
    if (hiddenInAdmin) return
    windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight }
    isMobileRef.current = window.innerWidth < 768
    posRef.current.x = Math.random() * Math.min(300, window.innerWidth)
    setIsMobileState(isMobileRef.current)
    
    const handleResize = () => {
      windowSizeRef.current = { width: window.innerWidth, height: window.innerHeight }
      isMobileRef.current = window.innerWidth < 768
      setIsMobileState(isMobileRef.current)
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [hiddenInAdmin])

  const currentScale = isMobileState ? 0.35 : 0.5
  const visibleWidth = Math.round(CELL_WIDTH * currentScale)
  const visibleHeight = Math.round(CELL_HEIGHT * currentScale)

  const posRef = useRef({ x: 0, y: 0 })
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
  const phraseIndexRef = useRef(0)

  const foodRef = useRef<{ x: number, y: number, velY: number } | null>(null)
  const foodElementRef = useRef<HTMLDivElement>(null)
  const selectionTargetRef = useRef<{ x: number, text: string } | null>(null)
  const lastSpokenSelectionRef = useRef<string | null>(null)
  
  const activeInputRef = useRef<HTMLElement | null>(null)
  const inputKeystrokesRef = useRef(0)

  const showSpeech = (phrases: string[], durationMs?: number) => {
    if (!bubbleRef.current) return
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current)
    const phrase = phrases[phraseIndexRef.current % phrases.length]
    phraseIndexRef.current += 1
    bubbleRef.current.textContent = phrase
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

  useEffect(() => {
    if (hiddenInAdmin) return
    if (!spritesheetUrl) return
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.src = spritesheetUrl
    img.onload = () => { imgRef.current = img; setLoaded(true) }
    return () => { img.onload = null }
  }, [hiddenInAdmin, spritesheetUrl])

  useEffect(() => {
    if (hiddenInAdmin) return
    function handlePointerMove(e: PointerEvent) {
      if (!isDraggingRef.current) return

      const dx = e.clientX - lastPointerPosRef.current.x
      const dy = e.clientY - lastPointerPosRef.current.y

      dragDistanceRef.current += Math.abs(dx) + Math.abs(dy)

      posRef.current.x += dx
      posRef.current.y += dy

      // Clamp bounds immediately while dragging
      const winW = windowSizeRef.current.width
      const winH = windowSizeRef.current.height
      const currentVisibleWidth = Math.round(CELL_WIDTH * (isMobileRef.current ? 0.35 : 0.5))
      const currentVisibleHeight = Math.round(CELL_HEIGHT * (isMobileRef.current ? 0.35 : 0.5))
      if (posRef.current.x < 0) posRef.current.x = 0
      if (posRef.current.x > winW - currentVisibleWidth) posRef.current.x = winW - currentVisibleWidth
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > winH - currentVisibleHeight) posRef.current.y = winH - currentVisibleHeight

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
          showSpeech(clickPhrases, 2000)
        } else {
          // Apply the throw!
          velRef.current.x = dragVelocityRef.current.x
          velRef.current.y = dragVelocityRef.current.y
          wasThrownRef.current = true
        }
      }
    }

    function handleSelectionChange() {
      const selection = document.getSelection()
      if (selection && selection.toString().trim().length > 0) {
        // Find the center X of the first range
        const range = selection.getRangeAt(0)
        const rect = range.getBoundingClientRect()
        const centerX = rect.left + rect.width / 2
        
        selectionTargetRef.current = { x: centerX, text: selection.toString().trim() }
      } else {
        selectionTargetRef.current = null
      }
    }

    function handleFocusIn(e: FocusEvent) {
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        // Ignore navbar or header inputs
        if (target.closest('nav') || target.closest('header')) return
        activeInputRef.current = target
        inputKeystrokesRef.current = 0
      }
    }

    function handleFocusOut(e: FocusEvent) {
      if (activeInputRef.current === e.target) {
        activeInputRef.current = null
      }
    }

    function handleInputEvent(e: Event) {
      if (activeInputRef.current === e.target) {
        inputKeystrokesRef.current++
      }
    }

    function handleVisibilityChange() {
      setPageVisible(!document.hidden)
      lastTimeRef.current = 0
    }

    window.addEventListener('pointermove', handlePointerMove)
    window.addEventListener('pointerup', handlePointerUp)
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('focusin', handleFocusIn)
    document.addEventListener('focusout', handleFocusOut)
    document.addEventListener('input', handleInputEvent)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerup', handlePointerUp)
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('focusin', handleFocusIn)
      document.removeEventListener('focusout', handleFocusOut)
      document.removeEventListener('input', handleInputEvent)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [hiddenInAdmin])

  useEffect(() => {
    if (hiddenInAdmin || !loaded || !spritesheetUrl || !pageVisible) return
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const currentVisibleHeight = Math.round(CELL_HEIGHT * (isMobileRef.current ? 0.35 : 0.5))
    // eslint-disable-next-line react-hooks/immutability
    posRef.current.y = windowSizeRef.current.height - currentVisibleHeight

    function changeState(newStateName: string) {
      if (stateRef.current.name === newStateName) return
      const st = CODEX_PET_STATES.find(s => s.name === newStateName)
      if (st) {
        stateRef.current = st
        frameRef.current = 0
      }
    }

    function draw(time: number) {
      const isMobile = isMobileRef.current
      const winW = windowSizeRef.current.width
      const winH = windowSizeRef.current.height
      const speedMult = isMobile ? 0.2 : 0.4
      const currentVisibleWidth = Math.round(CELL_WIDTH * (isMobile ? 0.35 : 0.5))
      const currentVisibleHeight = Math.round(CELL_HEIGHT * (isMobile ? 0.35 : 0.5))

      if (isDraggingRef.current) {
        // User is holding the pet
        changeState('waiting') // acts like it's dangling
        velRef.current.x = 0
        velRef.current.y = 0
      }
      else if (posRef.current.y < winH - currentVisibleHeight || Math.abs(velRef.current.y) > 0.1 || Math.abs(velRef.current.x) > 10) {
        // IN THE AIR or Thrown fast
        velRef.current.y += 0.8 * speedMult // Gravity

        // Wall Bounce while flying (Predictive)
        if (posRef.current.x + velRef.current.x <= 0) {
          posRef.current.x = 0
          velRef.current.x *= -0.7
          changeState('running-right')
        } else if (posRef.current.x + velRef.current.x + currentVisibleWidth >= winW) {
          posRef.current.x = winW - currentVisibleWidth
          velRef.current.x *= -0.7
          changeState('running-left')
        }

        // Ceiling Bounce while flying (Predictive)
        if (posRef.current.y + velRef.current.y <= 0) {
          posRef.current.y = 0
          velRef.current.y = Math.abs(velRef.current.y * 0.5) // Force it to go down
        }

        // Floor collision and bounce (Predictive)
        if (posRef.current.y + velRef.current.y >= winH - currentVisibleHeight) {
          posRef.current.y = winH - currentVisibleHeight
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
              showSpeech(thrownPhrases, 3000)
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
        if (foodRef.current) {
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
            if (foodRef.current.y >= winH - 50) {
              foodRef.current = null
              showSpeech(foodPhrases, 3000)
              velRef.current.y = -8 * speedMult // Happy jump
              changeState('jumping')
            }
          }
          stateTimerRef.current = 0 // Keep timer reset while chasing
        } else if (activeInputRef.current) {
          // INPUT INSPECTOR LOGIC
          const rect = activeInputRef.current.getBoundingClientRect()
          const targetX = rect.left + rect.width / 2
          const dist = targetX - (posRef.current.x + currentVisibleWidth / 2)
          
          if (Math.abs(dist) > 20) {
            if (dist > 0) {
              changeState('running-right')
              velRef.current.x = 6.0 * speedMult
            } else {
              changeState('running-left')
              velRef.current.x = -6.0 * speedMult
            }
            stateTimerRef.current = 0
          } else {
            velRef.current.x = 0
            changeState('idle') // Staring up at the input
            
            // Periodically mock the user's typing
            stateTimerRef.current++
            if (stateTimerRef.current > 60 * 4) { // Every 4 seconds
               stateTimerRef.current = 0
               const strokes = inputKeystrokesRef.current
               let phrase = ""
               if (strokes === 0) {
                  phrase = typingIdlePhrase
               } else if (strokes < 5) {
                  phrase = typingSlowPhrase
               } else {
                  phrase = typingCommentPhrases[Math.floor(Math.random() * typingCommentPhrases.length)]
               }
               showSpeech([phrase], 3000)
               inputKeystrokesRef.current = 0 // Reset for next batch
            }
          }
        } else if (selectionTargetRef.current) {
          // READING BUDDY LOGIC
          const dist = selectionTargetRef.current.x - (posRef.current.x + currentVisibleWidth / 2)
          
          if (Math.abs(dist) > 20) {
            if (dist > 0) {
              changeState('running-right')
              velRef.current.x = 6.0 * speedMult
            } else {
              changeState('running-left')
              velRef.current.x = -6.0 * speedMult
            }
          } else {
            velRef.current.x = 0
            changeState('idle') // Staring at the text
            
            if (lastSpokenSelectionRef.current !== selectionTargetRef.current.text) {
              lastSpokenSelectionRef.current = selectionTargetRef.current.text
              const randomPhrase = readingPhrases[Math.floor(Math.random() * readingPhrases.length)]
              showSpeech([randomPhrase], 4000)
            }
          }
          stateTimerRef.current = 0 // Keep timer reset while staring
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
              showSpeech(idlePhrases, 3000)
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
          } else if (posRef.current.x + currentVisibleWidth >= winW) {
            posRef.current.x = winW - currentVisibleWidth
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
      if (posRef.current.x > winW - currentVisibleWidth) posRef.current.x = winW - currentVisibleWidth
      if (posRef.current.y < 0) posRef.current.y = 0
      if (posRef.current.y > winH - currentVisibleHeight) posRef.current.y = winH - currentVisibleHeight

      // FOOD PHYSICS
      if (foodRef.current) {
        foodRef.current.velY += 0.8 * speedMult // Gravity for food
        foodRef.current.y += foodRef.current.velY

        // Floor collision for food
        if (foodRef.current.y > winH - 30) {
          foodRef.current.y = winH - 30
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
  }, [hiddenInAdmin, loaded, pageVisible, spritesheetUrl])

  if (hiddenInAdmin || !spritesheetUrl) return null

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
              showSpeech(hoverPhrases) // No timeout, stays while hovered
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
            showSpeech(grabbedPhrases) // No timeout, stays while grabbed
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
              x: Math.max(20, Math.random() * (windowSizeRef.current.width - 40)),
              y: -50,
              velY: 0
            }
            hideSpeech()
          }
        }}
        className="fixed bottom-4 left-4 z-[10000] bg-background/80 backdrop-blur-sm border border-border px-3 py-2 rounded-full shadow-lg text-sm font-medium hover:bg-muted transition-colors pointer-events-auto flex items-center gap-2"
      >
        <span>🍎</span> <span className="hidden sm:inline" suppressHydrationWarning>{feedLabel}</span>
      </button>
    </div>
  )
}
