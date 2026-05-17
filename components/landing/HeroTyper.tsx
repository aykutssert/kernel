'use client'

import { useEffect, useRef, useState } from 'react'
import { useTranslations } from 'next-intl'

const TYPE_SPEED = 55

export function HeroTyper({ className }: { className?: string }) {
  const t = useTranslations()
  const TEXT = t('hero_text')
  const [displayed, setDisplayed] = useState('')
  const index = useRef(0)

  useEffect(() => {
    index.current = 0
    setDisplayed('')

    let timer: ReturnType<typeof setTimeout>

    function tick() {
      if (index.current < TEXT.length) {
        index.current++
        setDisplayed(TEXT.slice(0, index.current))
        timer = setTimeout(tick, TYPE_SPEED)
      }
    }

    timer = setTimeout(tick, TYPE_SPEED)
    return () => clearTimeout(timer)
  }, [TEXT])

  return (
    <span className={className}>
      {displayed}
    </span>
  )
}
