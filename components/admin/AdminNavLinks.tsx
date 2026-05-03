'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function AdminNavLinks() {
  const pathname = usePathname()

  const overviewActive = pathname === '/admin'
  const docsActive = pathname.startsWith('/admin/docs') || pathname.startsWith('/admin/edit') || pathname.startsWith('/admin/new') || (pathname.startsWith('/admin/preview') && !pathname.startsWith('/admin/preview/pet'))
  const petsActive = pathname.startsWith('/admin/pets') || pathname.startsWith('/admin/preview/pet')

  const linkClass = (active: boolean) =>
    cn(
      'text-sm px-2 py-1 rounded-md transition-colors',
      active ? 'text-foreground font-medium' : 'text-muted-foreground hover:text-foreground'
    )

  return (
    <div className="flex items-center gap-1">
      <Link href="/admin" className={linkClass(overviewActive)}>Overview</Link>
      <Link href="/admin/docs" className={linkClass(docsActive)}>Docs</Link>
      <Link href="/admin/pets" className={linkClass(petsActive)}>Pets</Link>
    </div>
  )
}
