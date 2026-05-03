import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { id } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data } = await supabase.from('pets').select('views_count').eq('id', id).single()
  const next = (data?.views_count ?? 0) + 1
  await supabase.from('pets').update({ views_count: next }).eq('id', id)
  revalidateTag('pets', 'max')
  return NextResponse.json({ ok: true, views_count: next })
}
