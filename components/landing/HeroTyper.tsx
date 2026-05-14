'use client'

import { useEffect, useRef, useState } from 'react'

const TEXT = "Things I've built"
const MIN_CHARS = 7
const TYPE_SPEED = 55
const PAUSE_AFTER = 2000
const DELETE_SPEED = 35
const PAUSE_BEFORE_RESTART = 400

export function HeroTyper({ className }: { className?: string }) {
  const [displayed, setDisplayed] = useState('')
  const phase = useRef<'typing' | 'pause' | 'deleting' | 'waiting'>('typing')
  const index = useRef(0)

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>

    function tick() {
      if (phase.current === 'typing') {
        if (index.current < TEXT.length) {
          index.current++
          setDisplayed(TEXT.slice(0, index.current))
          timer = setTimeout(tick, TYPE_SPEED)
        } else {
          phase.current = 'pause'
          timer = setTimeout(tick, PAUSE_AFTER)
        }
      } else if (phase.current === 'pause') {
        phase.current = 'deleting'
        timer = setTimeout(tick, DELETE_SPEED)
      } else if (phase.current === 'deleting') {
        if (index.current > MIN_CHARS) {
          index.current--
          setDisplayed(TEXT.slice(0, index.current))
          timer = setTimeout(tick, DELETE_SPEED)
        } else {
          phase.current = 'waiting'
          timer = setTimeout(tick, PAUSE_BEFORE_RESTART)
        }
      } else {
        phase.current = 'typing'
        timer = setTimeout(tick, TYPE_SPEED)
      }
    }

    timer = setTimeout(tick, TYPE_SPEED)
    return () => clearTimeout(timer)
  }, [])

  return (
    <span className={className}>
      {displayed}
    </span>
  )
}
