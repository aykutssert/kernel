import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  const body = await req.json() as {
    id: string
    display_name: string
    description: string
    spritesheet_url: string
    source_url?: string
    published: boolean
    is_nsfw: boolean
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const { error } = await supabase.from('pets').upsert({
    id: body.id,
    display_name: body.display_name,
    description: body.description,
    spritesheet_url: body.spritesheet_url,
    source_url: body.source_url || null,
    published: body.published,
    is_nsfw: body.is_nsfw,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  revalidateTag('pets', 'max')
  return NextResponse.json({ ok: true })
}
