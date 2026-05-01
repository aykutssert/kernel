import Link from 'next/link'
import Image from 'next/image'
import { ThemeToggle } from './ThemeToggle'
import { SearchTrigger } from '@/components/search/SearchTrigger'
import { MobileNav } from './MobileNav'
import type { DocMeta } from '@/types'

export function Navbar({ docs = [] }: { docs?: DocMeta[] }) {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-[57px] items-center gap-4 px-4 md:px-0 max-w-[1400px] mx-auto w-full">
        <MobileNav docs={docs} />

        <Link href="/" className="flex items-center gap-2 shrink-0">
          <Image
            src="/kernel-logo.svg"
            alt="Kernel"
            width={24}
            height={24}
            priority
          />
          <span className="font-semibold text-sm">Kernel</span>
        </Link>

        <div className="flex-1">
          <SearchTrigger />
        </div>

        <ThemeToggle />
      </div>
    </header>
  )
}
