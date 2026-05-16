'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Bot, FileText, Menu, MessageSquarePlus, PawPrint, Sparkles, User, UserRound, X, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useSyncExternalStore } from 'react'
import { FeedbackModal } from '@/components/feedback/FeedbackModal'
import { ConnectDialog } from '@/components/mcp/ConnectDialog'
import { useAuth } from '@/components/auth/AuthContext'
import { ROAMING_PET_STORAGE_KEY, ROAMING_PET_EVENT } from '@/components/pets/RoamingPetToggle'
import { cn } from '@/lib/utils'
import type { DocMeta } from '@/types'

function readPetEnabled() {
  if (typeof window === 'undefined') return true
  return window.localStorage.getItem(ROAMING_PET_STORAGE_KEY) !== 'false'
}

function subscribePet(callback: () => void) {
  if (typeof window === 'undefined') return () => {}
  function onStorage(event: StorageEvent) {
    if (event.key === ROAMING_PET_STORAGE_KEY) callback()
  }
  window.addEventListener(ROAMING_PET_EVENT, callback)
  window.addEventListener('storage', onStorage)
  return () => {
    window.removeEventListener(ROAMING_PET_EVENT, callback)
    window.removeEventListener('storage', onStorage)
  }
}

function MobileCategoryGroup({
  category,
  pages,
  pathname,
  defaultOpen,
}: {
  category: string
  pages: DocMeta[]
  pathname: string
  defaultOpen: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="border-b border-border last:border-0 pb-1 last:pb-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
      >
        {category}
        <ChevronDown className={cn('w-3.5 h-3.5 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="pb-2">
          <ul className="space-y-0.5">
            {pages.map((page) => {
              const href = `/docs/${page.category}/${page.slug}`
              return (
                <li key={page.id}>
                  <Link
                    href={href}
                    className={cn(
                      'block py-1.5 px-2 rounded-md text-sm transition-colors',
                      pathname === href
                        ? 'bg-[#E5E5DF] dark:bg-[#1E1917] text-foreground font-medium'
                        : 'text-muted-foreground hover:text-foreground hover:bg-[#EEEEE8] dark:hover:bg-[#171513]'
                    )}
                  >
                    {page.title}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}

export function MobileNav({ docs }: { docs: DocMeta[] }) {
  const [open, setOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)
  const pathname = usePathname()
  const petEnabled = useSyncExternalStore(subscribePet, readPetEnabled, () => true)
  const { user } = useAuth()
  const isLoggedIn = !!user

  function togglePet() {
    const next = !readPetEnabled()
    window.localStorage.setItem(ROAMING_PET_STORAGE_KEY, String(next))
    window.dispatchEvent(new Event(ROAMING_PET_EVENT))
  }

  useEffect(() => {
    const timer = window.setTimeout(() => setOpen(false), 0)
    return () => window.clearTimeout(timer)
  }, [pathname])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const grouped = docs.reduce<Record<string, DocMeta[]>>((acc, doc) => {
    if (!acc[doc.category]) acc[doc.category] = []
    acc[doc.category].push(doc)
    return acc
  }, {})

  const activeCategory = pathname.startsWith('/docs/')
    ? pathname.split('/')[2]
    : null

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="md:hidden p-1.5 rounded-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] text-muted-foreground hover:text-foreground transition-colors"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5" />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[200] bg-black/40" onClick={() => setOpen(false)} />

          <div className="fixed top-0 left-0 bottom-0 z-[201] w-72 bg-background border-r shadow-xl flex flex-col">
            <div className="sticky top-0 flex items-center justify-between px-4 h-14 border-b bg-background shrink-0">
              <span className="text-sm font-semibold">Menu</span>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-md hover:bg-[#EEEEE8] dark:hover:bg-[#171513] text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              <div className="mb-4 border-b border-border pb-3">
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Navigate
                </p>
                <Link
                  href="/#projects"
                  className={cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]')}
                >
                  <Sparkles className="h-4 w-4" />
                  Projects
                </Link>
                <Link
                  href="/#about"
                  className={cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]')}
                >
                  <User className="h-4 w-4" />
                  About
                </Link>
                <Link
                  href="/#contact"
                  className={cn('flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]')}
                >
                  <FileText className="h-4 w-4" />
                  Contact
                </Link>
              </div>

              <div className="mb-4 border-b border-border pb-3">
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Studio
                </p>
                <Link
                  href="/tshirt-studio"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/tshirt-studio')
                      ? 'bg-[#E5E5DF] text-foreground dark:bg-[#1E1917]'
                      : 'text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]'
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  T-Shirt Studio
                </Link>
              </div>

              <div className="mb-3 space-y-1 border-b border-border pb-3">
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                  Developers
                </p>
                <Link
                  href="/prompts"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/prompts')
                      ? 'bg-[#E5E5DF] text-foreground dark:bg-[#1E1917]'
                      : 'text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]'
                  )}
                >
                  <Sparkles className="h-4 w-4" />
                  Prompts
                </Link>
                <Link
                  href="/pets"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/pets')
                      ? 'bg-[#E5E5DF] dark:bg-[#1E1917] text-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[#EEEEE8] dark:hover:bg-[#171513]'
                  )}
                >
                  <PawPrint className="w-4 h-4" />
                  Codex Pets
                </Link>
                <Link
                  href="/docs"
                  className={cn(
                    'flex items-center gap-2 rounded-md px-2 py-2 text-sm font-medium transition-colors',
                    pathname.startsWith('/docs')
                      ? 'bg-[#E5E5DF] text-foreground dark:bg-[#1E1917]'
                      : 'text-muted-foreground hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]'
                  )}
                >
                  <FileText className="h-4 w-4" />
                  Blog
                </Link>
              </div>

              {!isLoggedIn && (
                <div className="mb-3 space-y-1 border-b border-border pb-3">
                  <button
                    type="button"
                    onClick={() => { setOpen(false); window.dispatchEvent(new Event('kernel-auth-open')) }}
                    className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]"
                  >
                    <UserRound className="h-4 w-4" />
                    Sign in
                  </button>
                </div>
              )}

              <div className="mb-3 space-y-1 border-b border-border pb-3">
                <button
                  type="button"
                  onClick={() => { setOpen(false); setFeedbackOpen(true) }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]"
                >
                  <MessageSquarePlus className="h-4 w-4" />
                  Suggest
                </button>
                <button
                  type="button"
                  onClick={() => { setOpen(false); setConnectOpen(true) }}
                  className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]"
                >
                  <Bot className="h-4 w-4" />
                  MCP
                </button>
                <button
                  type="button"
                  onClick={togglePet}
                  className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-[#EEEEE8] hover:text-foreground dark:hover:bg-[#171513]"
                >
                  <span className="flex items-center gap-2">
                    <PawPrint className={`h-4 w-4 ${petEnabled ? 'text-green-500' : 'text-red-400'}`} />
                    Pet
                  </span>
                  <span className={`text-xs font-medium ${petEnabled ? 'text-green-500' : 'text-red-400'}`}>
                    {petEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              </div>

              {/* Doc categories as accordion */}
              {Object.entries(grouped).map(([category, pages]) => (
                <MobileCategoryGroup
                  key={category}
                  category={category}
                  pages={pages}
                  pathname={pathname}
                  defaultOpen={category === activeCategory}
                />
              ))}
            </nav>
          </div>
        </>,
        document.body
      )}

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <ConnectDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </>
  )
}
