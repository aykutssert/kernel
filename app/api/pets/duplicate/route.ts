import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const { id } = await req.json()
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: original, error: fetchError } = await supabase
    .from('pets')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Pet not found' }, { status: 404 })
  }

  const baseId = `${id}-copy`
  const { data: existing } = await supabase.from('pets').select('id').eq('id', baseId).single()
  const newId = existing ? `${id}-copy-${Date.now()}` : baseId

  const { error } = await supabase.from('pets').insert({
    id: newId,
    display_name: `Copy of ${original.display_name}`,
    description: original.description,
    spritesheet_url: original.spritesheet_url,
    source_url: original.source_url,
    published: false,
    is_nsfw: original.is_nsfw,
    likes_count: 0,
    views_count: 0,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('pets', 'max')
  return NextResponse.json({ id: newId })
}
