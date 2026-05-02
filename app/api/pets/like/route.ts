import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const rateLimit = new Map<string, number[]>()
const WINDOW_MS = 60_000
const MAX_REQ = 10

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const hits = (rateLimit.get(ip) ?? []).filter((t) => now - t < WINDOW_MS)
  hits.push(now)
  rateLimit.set(ip, hits)
  return hits.length > MAX_REQ
}

function admin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const fp = searchParams.get('fp')
  if (!id || !fp) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = admin()
  const [{ data: pet }, { data: like }] = await Promise.all([
    supabase.from('pets').select('likes_count').eq('id', id).single(),
    supabase.from('pet_likes').select('pet_id').eq('pet_id', id).eq('fingerprint', fp).maybeSingle(),
  ])

  return NextResponse.json({ liked: !!like, count: pet?.likes_count ?? 0 })
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id, fingerprint } = await req.json() as { id: string; fingerprint: string }
  if (!id || !fingerprint || fingerprint.length > 64) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const supabase = admin()

  const { data: existing } = await supabase
    .from('pet_likes')
    .select('pet_id')
    .eq('pet_id', id)
    .eq('fingerprint', fingerprint)
    .maybeSingle()

  if (existing) {
    await supabase.from('pet_likes').delete().eq('pet_id', id).eq('fingerprint', fingerprint)
    await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: -1 })
  } else {
    await supabase.from('pet_likes').insert({ pet_id: id, fingerprint })
    await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: 1 })
  }

  const { data: updated } = await supabase.from('pets').select('likes_count').eq('id', id).single()
  return NextResponse.json({ liked: !existing, count: updated?.likes_count ?? 0 })
}
