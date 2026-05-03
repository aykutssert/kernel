import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const formData = await req.formData()

  const id = formData.get('id') as string
  const display_name = formData.get('display_name') as string
  const description = formData.get('description') as string
  const published = formData.get('published') === 'true'
  const is_nsfw = formData.get('is_nsfw') === 'true'
  const webp = formData.get('webp') as File | null

  if (!id || !display_name || !webp) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { data: existing } = await supabase.from('pets').select('id').eq('id', id).single()
  if (existing) {
    return NextResponse.json({ ok: true, skipped: true })
  }

  const buffer = Buffer.from(await webp.arrayBuffer())
  const filename = `${id}.webp`

  const { error: uploadError } = await supabase.storage
    .from('kernel')
    .upload(filename, buffer, { contentType: 'image/webp', upsert: false })

  if (uploadError && uploadError.message !== 'The resource already exists') {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('kernel').getPublicUrl(filename)

  const { error: dbError } = await supabase.from('pets').insert({
    id,
    display_name,
    description: description || null,
    spritesheet_url: urlData.publicUrl,
    published,
    is_nsfw,
  })

  if (dbError) return NextResponse.json({ error: dbError.message }, { status: 500 })

  revalidateTag('pets', 'max')
  return NextResponse.json({ ok: true, skipped: false })
}
