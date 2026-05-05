import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Admin kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ docs: [], pets: [] })
  const safe = q.replace(/[%_\\]/g, '\\$&')

  const [docsRes, petsRes] = await Promise.all([
    supabase
      .from('docs')
      .select('id, title, category, slug, published')
      .or(`title.ilike.%${safe}%,slug.ilike.%${safe}%,category.ilike.%${safe}%`)
      .limit(6),
    supabase
      .from('pets')
      .select('id, display_name, published')
      .or(`display_name.ilike.%${safe}%,id.ilike.%${safe}%`)
      .limit(6),
  ])

  return NextResponse.json({
    docs: docsRes.data ?? [],
    pets: petsRes.data ?? [],
  })
}
