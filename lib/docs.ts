import { cacheTag, cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import type { Doc, DocMeta } from '@/types'

export async function getDocs(): Promise<DocMeta[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, order_index, published, tags')
    .eq('published', true)
    .order('category')
    .order('order_index')
  return data ?? []
}

export async function getDoc(category: string, slug: string): Promise<Doc | null> {
  'use cache'
  cacheTag('docs', `doc-${category}-${slug}`)
  cacheLife('max')
  const supabase = createPublicClient()
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
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('category')
    .eq('published', true)
    .order('category')
  if (!data) return []
  return [...new Set(data.map((d) => d.category))]
}

export async function getAllCategories(): Promise<string[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('category')
    .order('category')
  if (!data) return []
  return [...new Set(data.map((d) => d.category))]
}

export async function getAllDocsMeta(): Promise<Pick<Doc, 'id' | 'title' | 'slug' | 'category' | 'order_index'>[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, order_index')
    .order('category')
    .order('order_index')
  return data ?? []
}

export async function getDocsByTag(tag: string): Promise<DocMeta[]> {
  'use cache'
  cacheTag('docs', `tag-${tag}`)
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, order_index, published, tags')
    .eq('published', true)
    .contains('tags', [tag])
    .order('category')
    .order('order_index')
  return data ?? []
}

export async function getAllTags(): Promise<string[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('tags')
    .eq('published', true)
  if (!data) return []
  const all = data.flatMap((d) => d.tags ?? [])
  return [...new Set(all)].sort()
}

export async function getAllDocParams(): Promise<{ category: string; slug: string }[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('category, slug')
    .eq('published', true)
  return data ?? []
}
