'use client'

import { useEffect, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

export function ScrollFadeAside({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const ref = useRef<HTMLElement>(null)
  const [showTop, setShowTop] = useState(false)
  const [showBottom, setShowBottom] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    function update() {
      if (!el) return
      setShowTop(el.scrollTop > 8)
      setShowBottom(el.scrollTop + el.clientHeight < el.scrollHeight - 8)
    }

    update()
    el.addEventListener('scroll', update, { passive: true })
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => { el.removeEventListener('scroll', update); ro.disconnect() }
  }, [])

  return (
    <aside ref={ref} className={cn('relative', className)}>
      <div
        className={cn(
          'pointer-events-none sticky top-0 left-0 right-0 h-8 bg-gradient-to-b from-background to-transparent z-10 transition-opacity duration-150',
          showTop ? 'opacity-100' : 'opacity-0'
        )}
      />
      {children}
      <div
        className={cn(
          'pointer-events-none sticky bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background to-transparent z-10 transition-opacity duration-150',
          showBottom ? 'opacity-100' : 'opacity-0'
        )}
      />
    </aside>
  )
}
