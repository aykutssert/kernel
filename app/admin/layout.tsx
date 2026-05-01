import Link from 'next/link'
import Image from 'next/image'
import { Plus } from 'lucide-react'
import { LogoutButton } from '@/components/admin/LogoutButton'
import { ThemeToggle } from '@/components/layout/ThemeToggle'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen">
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="flex h-[57px] items-center gap-4 px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/kernel-logo.svg" alt="Kernel" width={20} height={20} />
            <span className="font-semibold text-sm">Kernel</span>
          </Link>
          <span className="text-muted-foreground">/</span>
          <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Admin
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <Link
              href="/admin/new"
              className="inline-flex items-center gap-1.5 text-sm bg-foreground text-background px-3 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            >
              <Plus className="w-3.5 h-3.5" />
              New doc
            </Link>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-8">{children}</main>
    </div>
  )
}
