import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

export async function DELETE(req: Request) {
  const { id } = await req.json() as { id: string }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  await supabase.storage.from('kernel').remove([`pets/${id}/spritesheet.webp`])
  await supabase.from('pets').delete().eq('id', id)

  revalidateTag('pets', 'max')
  return NextResponse.json({ ok: true })
}
