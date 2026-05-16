'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const links = [
  { href: '/prompts', label: 'Prompts' },
  { href: '/pets', label: 'Codex Pets' },
  { href: '/docs', label: 'Blog' },
]

export function DeveloperSubnav() {
  const pathname = usePathname()

  return (
    <nav className="mb-6 flex items-center gap-1 border-b border-border">
      {links.map((link) => {
        const active = pathname.startsWith(link.href)

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              'relative -mb-px px-3 py-2 text-xs font-medium transition-colors',
              active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
            )}
          >
            {link.label}
            <span
              className={cn(
                'absolute bottom-0 left-0 h-px w-full transition-colors',
                active ? 'bg-foreground dark:bg-[#D5A27F]' : 'bg-transparent'
              )}
            />
          </Link>
        )
      })}
    </nav>
  )
}
