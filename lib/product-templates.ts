import { cacheLife, cacheTag } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import type { ProductTemplate } from '@/types'

export async function getProductTemplates(): Promise<ProductTemplate[]> {
  'use cache'
  cacheTag('product-templates')
  cacheLife('minutes')

  const supabase = createPublicClient()
  const { data } = await supabase
    .from('product_templates')
    .select('id, category, name, image_url, sort_order, is_active, created_at')
    .eq('is_active', true)
    .order('category')
    .order('sort_order')
    .order('created_at', { ascending: false })

  return data ?? []
}

export async function getProductTemplate(id: string): Promise<ProductTemplate | null> {
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('product_templates')
    .select('id, category, name, image_url, sort_order, is_active, created_at')
    .eq('id', id)
    .eq('is_active', true)
    .maybeSingle()

  return data ?? null
}
