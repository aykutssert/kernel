import { createClient } from '@/lib/supabase/server'
import type { Doc, DocMeta } from '@/types'

export async function getDocs(): Promise<DocMeta[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, order_index, published')
    .eq('published', true)
    .order('category')
    .order('order_index')
  return data ?? []
}

export async function getDoc(category: string, slug: string): Promise<Doc | null> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('*')
    .eq('category', category)
    .eq('slug', slug)
    .eq('published', true)
    .single()
  return data ?? null
}

export async function getCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('category')
    .eq('published', true)
    .order('category')
  if (!data) return []
  return [...new Set(data.map((d) => d.category))]
}

export async function getAllCategories(): Promise<string[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('category')
    .order('category')
  if (!data) return []
  return [...new Set(data.map((d) => d.category))]
}

export async function getAllDocParams(): Promise<{ category: string; slug: string }[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('category, slug')
    .eq('published', true)
  return data ?? []
}
