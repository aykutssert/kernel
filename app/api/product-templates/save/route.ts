import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin } from '@/lib/auth/admin'
import { PRODUCT_TEMPLATE_CATEGORY_VALUES } from '@/lib/product-template-categories'

function storagePathFromPublicUrl(url: string) {
  try {
    const path = new URL(url).pathname
    const marker = '/object/public/product-template-images/'
    const index = path.indexOf(marker)
    return index >= 0 ? path.slice(index + marker.length) : null
  } catch {
    return null
  }
}

export async function POST(req: Request) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({})) as {
    id?: string
    category?: string
    name?: string
    image_url?: string
    previous_image_url?: string
    sort_order?: number
    is_active?: boolean
  }

  const name = body.name?.trim()
  const imageUrl = body.image_url?.trim()
  if (!name || !imageUrl || !body.category || !PRODUCT_TEMPLATE_CATEGORY_VALUES.has(body.category)) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const payload = {
    ...(body.id ? { id: body.id } : {}),
    category: body.category,
    name,
    image_url: imageUrl,
    sort_order: Number.isFinite(body.sort_order) ? body.sort_order : 0,
    is_active: body.is_active ?? true,
  }

  const { data, error } = await supabase
    .from('product_templates')
    .upsert(payload)
    .select('id')
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (body.previous_image_url && body.previous_image_url !== imageUrl) {
    const oldPath = storagePathFromPublicUrl(body.previous_image_url)
    if (oldPath) {
      await supabase.storage.from('product-template-images').remove([oldPath])
    }
  }

  revalidateTag('product-templates', 'max')
  return NextResponse.json({ ok: true, id: data.id })
}
