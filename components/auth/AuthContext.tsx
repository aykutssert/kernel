'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

type AuthUser = {
  id: string
  email: string | null
  username: string | null
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, loading: true })

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadUser() {
      const res = await fetch('/api/auth/me', { cache: 'no-store' }).catch(() => null)
      if (!active) return
      if (!res?.ok) { setUser(null); setLoading(false); return }
      const data = await res.json().catch(() => null) as { user?: AuthUser | null } | null
      if (active) { setUser(data?.user ?? null); setLoading(false) }
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

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
