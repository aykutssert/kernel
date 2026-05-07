import { NextResponse } from 'next/server'
import sharp from 'sharp'
import { createClient, createServiceClient } from '@/lib/supabase/server'

export async function POST(req: Request) {
  const auth = await createClient()
  const { data: { user } } = await auth.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Sign in required' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('image') as File | null
  const templateId = String(formData.get('template_id') ?? '').trim()
  const name = String(formData.get('name') ?? '').trim()
  const userPrompt = String(formData.get('user_prompt') ?? '').trim()

  if (!file || !templateId || !name) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
  }

  const service = createServiceClient()
  const { data: template, error: templateError } = await service
    .from('product_templates')
    .select('id, category, image_url')
    .eq('id', templateId)
    .eq('is_active', true)
    .maybeSingle()

  if (templateError || !template) {
    return NextResponse.json({ error: 'Template not found' }, { status: 404 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())
  const webp = await sharp(buffer)
    .rotate()
    .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 88 })
    .toBuffer()
  const path = `${user.id}/${Date.now()}.webp`

  const { error: uploadError } = await service.storage
    .from('product-images')
    .upload(path, webp, { contentType: 'image/webp', upsert: false })

  if (uploadError) {
    return NextResponse.json({ error: uploadError.message }, { status: 500 })
  }

  const { data: publicUrl } = service.storage.from('product-images').getPublicUrl(path)
  const { data, error } = await service
    .from('products')
    .insert({
      user_id: user.id,
      category: template.category,
      name,
      image_url: publicUrl.publicUrl,
      product_prompt: userPrompt || null,
    })
    .select('id')
    .single()

  if (error) {
    await service.storage.from('product-images').remove([path])
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id })
}
