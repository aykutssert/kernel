'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Heart, LogOut, UserRound } from 'lucide-react'
import { AuthDialog } from './AuthDialog'
import { createClient } from '@/lib/supabase/client'

type AuthMode = 'signin' | 'signup' | 'forgot'

type AuthUser = {
  id: string
  email: string | null
  username: string | null
}

export function AuthButton() {
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [mode, setMode] = useState<AuthMode>('signin')

  useEffect(() => {
    let active = true

    async function loadUser() {
      const response = await fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null)
      if (!response?.ok || !active) return

      const payload = await response.json().catch(() => null) as { user?: AuthUser | null } | null
      if (active) setUser(payload?.user ?? null)
    }

    void loadUser()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      void loadUser()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [])

  useEffect(() => {
    if (!menuOpen) return

    function onPointerDown(event: PointerEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [menuOpen])

  useEffect(() => {
    function onAuthOpen() {
      setMode('signin')
      setDialogOpen(true)
    }

    window.addEventListener('kernel-auth-open', onAuthOpen)
    return () => window.removeEventListener('kernel-auth-open', onAuthOpen)
  }, [])

  function openAuth(nextMode: AuthMode) {
    setMode(nextMode)
    setDialogOpen(true)
  }

  async function handleSignOut() {
    await fetch('/api/auth/signout', { method: 'POST' })
    setUser(null)
    setMenuOpen(false)
    router.refresh()
  }

  if (!user) {
    return (
      <>
        <button
          type="button"
          onClick={() => openAuth('signin')}
          className="hidden md:flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        >
          <UserRound className="h-3.5 w-3.5" />
          <span>Sign in</span>
        </button>
        {dialogOpen && (
          <AuthDialog
            open={dialogOpen}
            mode={mode}
            onModeChange={setMode}
            onOpenChange={setDialogOpen}
            onAuthenticated={(nextUser) => {
              setUser(nextUser)
              router.refresh()
            }}
          />
        )}
      </>
    )
  }

  const label = user.username ? `@${user.username}` : user.email ?? 'Account'

  return (
    <div ref={menuRef} className="relative">
      <button
        type="button"
        onClick={() => setMenuOpen((open) => !open)}
        className="flex h-8 max-w-[132px] items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
      >
        <UserRound className="h-3.5 w-3.5 shrink-0" />
        <span className="hidden truncate sm:block">{label}</span>
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-44 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <div className="border-b border-border px-3 py-2">
            <p className="truncate text-xs font-medium">{label}</p>
            {user.email && <p className="mt-0.5 truncate text-[11px] text-muted-foreground">{user.email}</p>}
          </div>
          <Link
            href="/account/likes"
            onClick={() => setMenuOpen(false)}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Heart className="h-3.5 w-3.5" />
            Liked
          </Link>
          <button
            type="button"
            onClick={handleSignOut}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>
      )}
    </div>
  )
}
