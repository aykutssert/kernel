import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  const supabase = createServiceClient()

  const docQuery = supabase.from('docs').select('likes_count').eq('id', id).eq('published', true).single()
  const likeQuery = user
    ? supabase.from('doc_likes').select('doc_id').eq('doc_id', id).eq('user_id', user.id).maybeSingle()
    : Promise.resolve({ data: null })

  const [{ data: doc }, { data: like }] = await Promise.all([docQuery, likeQuery])

  return NextResponse.json({
    liked: Boolean(like),
    count: doc?.likes_count ?? 0,
  })
}

export async function POST(req: Request) {
  const { id } = await req.json().catch(() => ({})) as { id?: string }
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabase = createServiceClient()
  const { data: existing } = await supabase
    .from('doc_likes')
    .select('doc_id')
    .eq('doc_id', id)
    .eq('user_id', user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from('doc_likes').delete().eq('doc_id', id).eq('user_id', user.id)
    await supabase.rpc('adjust_doc_likes', { p_doc_id: id, p_delta: -1 })
  } else {
    await supabase.from('doc_likes').insert({ doc_id: id, user_id: user.id })
    await supabase.rpc('adjust_doc_likes', { p_doc_id: id, p_delta: 1 })
  }

  revalidateTag('docs', 'max')
  const { data: updated } = await supabase.from('docs').select('likes_count').eq('id', id).single()
  return NextResponse.json({
    liked: !existing,
    count: updated?.likes_count ?? 0,
  })
}
