import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function POST(req: Request) {
  const { id } = await req.json()
  const supabase = adminClient()

  const { data: original, error: fetchError } = await supabase
    .from('docs')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchError || !original) {
    return NextResponse.json({ error: 'Doc not found' }, { status: 404 })
  }

  const { data: maxRow } = await supabase
    .from('docs')
    .select('order_index')
    .eq('category', original.category)
    .order('order_index', { ascending: false })
    .limit(1)
    .single()

  const newId = crypto.randomUUID()
  const { error } = await supabase.from('docs').insert({
    id: newId,
    title: `Copy of ${original.title}`,
    slug: `${original.slug}-copy`,
    category: original.category,
    content: original.content,
    source_url: original.source_url,
    image_url: null,
    tags: original.tags,
    order_index: (maxRow?.order_index ?? 0) + 1,
    published: false,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('docs', 'max')
  return NextResponse.json({ id: newId })
}
