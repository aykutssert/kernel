import type { ProductTemplateCategory } from '@/lib/product-template-categories'

export interface Doc {
  id: string
  title: string
  slug: string
  category: string
  description: string | null
  content: string
  source_url: string | null
  image_url: string | null
  required_images: number | null
  variables: { name: string; default?: string }[]
  tags: string[]
  order_index: number
  published: boolean
  likes_count?: number | null
  created_at: string
  updated_at: string
  liked_by_me?: boolean
}

export interface DocMeta {
  id: string
  title: string
  slug: string
  category: string
  order_index: number
  published: boolean
  tags: string[]
  description: string | null
  image_url: string | null
  likes_count?: number | null
}

export type TaggedDoc = Pick<
  Doc,
  | 'id'
  | 'title'
  | 'slug'
  | 'category'
  | 'description'
  | 'content'
  | 'image_url'
  | 'order_index'
  | 'published'
  | 'tags'
  | 'created_at'
  | 'likes_count'
>

export interface DocVersion {
  id: string
  doc_id: string
  version_number: number
  content: string
  change_summary: string | null
  author_handle: string | null
  created_at: string
}

export interface ProductTemplate {
  id: string
  category: ProductTemplateCategory
  name: string
  image_url: string
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface ProductProduct {
  id: string
  user_id: string
  category: string
  name: string
  image_url: string
  product_prompt: string | null
  created_at: string
}
