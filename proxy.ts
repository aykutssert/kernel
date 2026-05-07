import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const LOCK_PRODUCTION_SITE = true

const PUBLIC_API_PREFIXES = [
  '/api/search',
  '/api/auth',
  '/api/docs/like',
  '/api/feedback',
  '/api/pets/like',
  '/api/pets/likes',
  '/api/pets/download',
  '/api/pets/view',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (LOCK_PRODUCTION_SITE && process.env.VERCEL_ENV === 'production') {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Site temporarily locked' }, { status: 503 })
    }

    if (pathname !== '/locked') {
      const url = request.nextUrl.clone()
      url.pathname = '/locked'
      return NextResponse.rewrite(url)
    }
  }

  const isPublicApi = pathname.startsWith('/api/')
    && PUBLIC_API_PREFIXES.some((p) => pathname.startsWith(p))

  if (isPublicApi) {
    return NextResponse.next({ request })
  }

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return NextResponse.next({ request })
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  let isAdmin = false

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()
    isAdmin = Boolean(profile?.is_admin)
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin/login'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/admin') && pathname !== '/admin/login' && user && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/prompts'
    return NextResponse.redirect(url)
  }

  if (pathname === '/admin/login' && user && isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/admin'
    return NextResponse.redirect(url)
  }

  if (pathname === '/admin/login' && user && !isAdmin) {
    const url = request.nextUrl.clone()
    url.pathname = '/prompts'
    return NextResponse.redirect(url)
  }

  if (pathname.startsWith('/api/')) {
    if (!user || !isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico|css|js|txt|xml)$).*)',
  ],
}
