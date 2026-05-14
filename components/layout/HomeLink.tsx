'use client'

import { useRouter } from 'next/navigation'

export function HomeLink({ children, className }: { children: React.ReactNode; className?: string }) {
  const router = useRouter()

  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    e.preventDefault()
    router.push('/')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <a href="/" onClick={handleClick} className={className}>
      {children}
    </a>
  )
}
