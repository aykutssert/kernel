'use client'

import { useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

export function StaggeredGrid({
  children,
  className,
  id,
  style,
}: {
  children: React.ReactNode
  className?: string
  id?: string
  style?: React.CSSProperties
}) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const items = Array.from(el.querySelectorAll(':scope > *')) as HTMLElement[]

    items.forEach((child) => {
      child.style.opacity = '0'
      child.style.transform = 'translateY(20px)'
      child.style.transition = 'opacity 0.5s ease-out, transform 0.5s ease-out'
    })

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          items.forEach((child, i) => {
            setTimeout(() => {
              child.style.opacity = '1'
              child.style.transform = 'translateY(0)'
            }, i * 70)
          })
          obs.disconnect()
        }
      },
      { threshold: 0.05 },
    )

    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div ref={ref} id={id} style={style} className={cn(className)}>
      {children}
    </div>
  )
}
