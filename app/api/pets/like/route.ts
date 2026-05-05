import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

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

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  const fp = searchParams.get('fp')
  if (!id) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user && !fp) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const supabase = createServiceClient()
  const petQuery = supabase.from('pets').select('likes_count').eq('id', id).single()
  const likeQuery = user
    ? supabase.from('pet_likes').select('pet_id').eq('pet_id', id).eq('user_id', user.id).maybeSingle()
    : supabase
        .from('pet_likes')
        .select('pet_id')
        .eq('pet_id', id)
        .eq('fingerprint', fp)
        .is('user_id', null)
        .maybeSingle()

  const [{ data: pet }, { data: like }] = await Promise.all([petQuery, likeQuery])

  return NextResponse.json({ liked: !!like, count: pet?.likes_count ?? 0 })
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] ?? 'unknown'
  if (isRateLimited(ip)) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const { id, fingerprint } = await req.json() as { id: string; fingerprint?: string }
  if (!id || (fingerprint && fingerprint.length > 64)) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()

  if (!user && !fingerprint) {
    return NextResponse.json({ error: 'Invalid params' }, { status: 400 })
  }

  const supabase = createServiceClient()

  if (user) {
    const { data: existing } = await supabase
      .from('pet_likes')
      .select('pet_id')
      .eq('pet_id', id)
      .eq('user_id', user.id)
      .maybeSingle()

    if (existing) {
      await supabase.from('pet_likes').delete().eq('pet_id', id).eq('user_id', user.id)
      await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: -1 })
    } else if (fingerprint) {
      const { data: anonymousLike } = await supabase
        .from('pet_likes')
        .select('pet_id')
        .eq('pet_id', id)
        .eq('fingerprint', fingerprint)
        .is('user_id', null)
        .maybeSingle()

      if (anonymousLike) {
        await supabase
          .from('pet_likes')
          .update({ user_id: user.id })
          .eq('pet_id', id)
          .eq('fingerprint', fingerprint)
          .is('user_id', null)
      } else {
        await supabase.from('pet_likes').insert({ pet_id: id, fingerprint, user_id: user.id })
        await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: 1 })
      }
    } else {
      await supabase.from('pet_likes').insert({ pet_id: id, user_id: user.id })
      await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: 1 })
    }

    revalidateTag('pets', 'max')
    const { data: updated } = await supabase.from('pets').select('likes_count').eq('id', id).single()
    return NextResponse.json({ liked: !existing, count: updated?.likes_count ?? 0 })
  }

  const { data: existing } = await supabase
    .from('pet_likes')
    .select('pet_id')
    .eq('pet_id', id)
    .eq('fingerprint', fingerprint)
    .is('user_id', null)
    .maybeSingle()

  if (existing) {
    await supabase
      .from('pet_likes')
      .delete()
      .eq('pet_id', id)
      .eq('fingerprint', fingerprint)
      .is('user_id', null)
    await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: -1 })
  } else {
    await supabase.from('pet_likes').insert({ pet_id: id, fingerprint })
    await supabase.rpc('adjust_pet_likes', { p_pet_id: id, p_delta: 1 })
  }

  revalidateTag('pets', 'max')
  const { data: updated } = await supabase.from('pets').select('likes_count').eq('id', id).single()
  return NextResponse.json({ liked: !existing, count: updated?.likes_count ?? 0 })
}
