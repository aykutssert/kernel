export interface Doc {
  id: string
  title: string
  slug: string
  category: string
  content: string
  source_url: string | null
  image_url: string | null
  required_images: number | null
  variables: { name: string; default?: string }[]
  tags: string[]
  order_index: number
  published: boolean
  created_at: string
  updated_at: string
}

export interface DocMeta {
  id: string
  title: string
  slug: string
  category: string
  order_index: number
  published: boolean
  tags: string[]
}
