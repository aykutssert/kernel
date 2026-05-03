import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  if (!q) return NextResponse.json({ docs: [], pets: [] })

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
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
