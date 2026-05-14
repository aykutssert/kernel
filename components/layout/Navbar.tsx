import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { MobileNav } from './MobileNav'
import { MoreMenu } from './MoreMenu'
import { AuthButton } from '@/components/auth/AuthButton'
import type { DocMeta } from '@/types'

export function Navbar({ docs = [] }: { docs?: DocMeta[] }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[57px] items-center gap-1.5 px-3 md:px-0 md:gap-4 max-w-[1400px] mx-auto w-full">
        <MobileNav docs={docs} />

        <Link href="/" className="flex items-center gap-1.5 shrink-0 pr-1 md:pr-0">
          <Image
            src="/kernel-logo.svg"
            alt="Kernel"
            width={20}
            height={20}
            className="md:w-6 md:h-6"
            priority
          />
          <span className="font-semibold text-sm">Kernel</span>
        </Link>

        <div className="flex-1">
          <SearchTrigger allTags={[...new Set(docs.flatMap((d) => d.tags ?? []))].sort()} />
        </div>

        <nav className="hidden md:flex items-center gap-1.5">
          <Link href="/#projects" className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            Projects
          </Link>
          <Link href="/#about" className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            About
          </Link>
          <Link href="/#contact" className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            Contact
          </Link>
          <Link href="/prompts" className="flex h-8 items-center rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            Blog
          </Link>
        </nav>

        <MoreMenu />
        <AuthButton />
        <ThemeToggle />
      </div>
    </header>
  )
}
