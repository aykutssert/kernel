import { cacheLife } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'
import type { Pet } from '@/lib/pets'
import type { TaggedDoc } from '@/types'
import { withPromptPreviews, type TaggedDocWithPreview } from '@/lib/prompt-preview'

type PetLikeRow = {
  created_at: string
  pets: Pet | null
}

export type LikedPet = Pet & {
  liked_at: string
}

type DocLikeRow = {
  created_at: string
  docs: TaggedDoc | null
}

export type LikedDoc = TaggedDocWithPreview & {
  liked_at: string
  liked_by_me: boolean
}

export async function getLikedPets(userId: string): Promise<LikedPet[]> {
  'use cache: private'
  cacheLife('minutes')

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('pet_likes')
    .select(`
      created_at,
      pets (
        id,
        display_name,
        description,
        spritesheet_url,
        source_url,
        published,
        is_nsfw,
        likes_count,
        views_count,
        created_at
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<PetLikeRow[]>()

  return (data ?? [])
    .filter((row): row is PetLikeRow & { pets: Pet } => Boolean(row.pets?.published))
    .filter((row) => !row.pets.is_nsfw)
    .map((row) => ({
      ...row.pets,
      liked_at: row.created_at,
    }))
}

export async function getLikedDocs(userId: string): Promise<LikedDoc[]> {
  'use cache: private'
  cacheLife('minutes')

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('doc_likes')
    .select(`
      created_at,
      docs (
        id,
        title,
        slug,
        category,
        description,
        content,
        image_url,
        order_index,
        published,
        tags,
        created_at,
        likes_count
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .returns<DocLikeRow[]>()

  const docs = (data ?? [])
    .filter((row): row is DocLikeRow & { docs: TaggedDoc } => Boolean(row.docs?.published))
    .map((row) => ({
      ...row.docs,
      liked_at: row.created_at,
      liked_by_me: true,
    }))

  return withPromptPreviews(docs, (doc) => doc.image_url ? 4 : 5)
}
