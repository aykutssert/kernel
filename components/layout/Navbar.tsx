import Link from 'next/link'
import Image from 'next/image'
import { Layers, User, Mail, BookOpen } from 'lucide-react'
import { ThemeToggle } from './ThemeToggle'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { MobileNav } from './MobileNav'
import { MoreMenu } from './MoreMenu'
import { AuthButton } from '@/components/auth/AuthButton'
import { HomeLink } from './HomeLink'
import type { DocMeta } from '@/types'

export function Navbar({ docs = [] }: { docs?: DocMeta[] }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[57px] items-center gap-1.5 px-3 md:px-0 md:gap-4 max-w-[1400px] mx-auto w-full">
        <MobileNav docs={docs} />

        <HomeLink className="flex items-center gap-1.5 shrink-0 pr-1 md:pr-0">
          <Image
            src="/kernel-logo.svg"
            alt="Kernel"
            width={20}
            height={20}
            className="md:w-6 md:h-6"
            priority
          />
          <span className="font-semibold text-sm">Kernel</span>
        </HomeLink>

        <div className="flex-1">
          <SearchTrigger allTags={[...new Set(docs.flatMap((d) => d.tags ?? []))].sort()} />
        </div>

        <div className="hidden md:flex items-center gap-1.5">
          <Link href="/#projects" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            <Layers className="w-3.5 h-3.5 text-violet-500" />
            Projects
          </Link>
          <Link href="/#about" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            <User className="w-3.5 h-3.5 text-blue-500" />
            About
          </Link>
          <Link href="/#contact" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            <Mail className="w-3.5 h-3.5 text-orange-500" />
            Contact
          </Link>
          <Link href="/prompts" className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground">
            <BookOpen className="w-3.5 h-3.5 text-emerald-500" />
            Blog
          </Link>
          <MoreMenu />
          <AuthButton />
        </div>
        <ThemeToggle />
      </div>
    </header>
  )
}
