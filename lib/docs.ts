import { cacheTag, cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import type { Doc, DocMeta, TaggedDoc, DocVersion } from '@/types'

type PromptSort = 'default' | 'alpha' | 'newest' | 'oldest'

function cleanIlikeQuery(q: string) {
  return q.trim().replace(/[,%_]/g, ' ').replace(/\s+/g, ' ')
}

export async function getDocVersions(docId: string): Promise<DocVersion[]> {
  'use cache'
  cacheTag('docs', `versions-${docId}`)
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('doc_versions')
    .select('*')
    .eq('doc_id', docId)
    .order('version_number', { ascending: false })
  return data ?? []
}

export async function getDocs(): Promise<DocMeta[]> {
  'use cache'
  cacheTag('docs')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, order_index, published, tags, description, image_url')
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

export async function getDocsByTag(tag: string): Promise<TaggedDoc[]> {
  'use cache'
  cacheTag('docs', `tag-${tag}`)
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, description, content, image_url, order_index, published, tags, created_at')
    .eq('published', true)
    .contains('tags', [tag])
    .order('category')
    .order('order_index')
  return data ?? []
}

export async function getPromptDocs(): Promise<TaggedDoc[]> {
  'use cache'
  cacheTag('docs', 'prompts')
  cacheLife('max')
  const supabase = createPublicClient()
  const { data } = await supabase
    .from('docs')
    .select('id, title, slug, category, description, content, image_url, order_index, published, tags, created_at, likes_count')
    .eq('published', true)
    .eq('category', 'prompts')
    .order('order_index')
  return data ?? []
}

export async function getPromptDocsFiltered({
  q = '',
  tags = [],
  sort = 'default',
}: {
  q?: string
  tags?: string[]
  sort?: PromptSort
}): Promise<TaggedDoc[]> {
  'use cache'
  cacheTag('docs', 'prompts')
  cacheLife('max')

  const supabase = createPublicClient()
  let query = supabase
    .from('docs')
    .select('id, title, slug, category, description, content, image_url, order_index, published, tags, created_at, likes_count')
    .eq('published', true)
    .eq('category', 'prompts')

  for (const tag of tags.filter(Boolean)) {
    query = query.contains('tags', [tag])
  }

  const safeQuery = cleanIlikeQuery(q)
  if (safeQuery) {
    query = query.or(`title.ilike.%${safeQuery}%,description.ilike.%${safeQuery}%,content.ilike.%${safeQuery}%`)
  }

  if (sort === 'alpha') {
    query = query.order('title', { ascending: true })
  } else if (sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  } else if (sort === 'oldest') {
    query = query.order('created_at', { ascending: true })
  } else {
    query = query.order('order_index')
  }

  const { data } = await query
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
