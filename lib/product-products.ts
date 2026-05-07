import { createClient } from '@/lib/supabase/server'
import type { ProductProduct } from '@/types'

export async function getMyProductProducts(): Promise<ProductProduct[]> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data } = await supabase
    .from('products')
    .select('id, user_id, category, name, image_url, product_prompt, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return data ?? []
}
