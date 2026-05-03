import { cacheTag, cacheLife } from 'next/cache'
import { createPublicClient } from '@/lib/supabase/server'
import type { Pet } from '@/lib/pets'

const PER_PAGE = 15

export { PER_PAGE }

export async function getPets(
  page: number,
  q: string,
  sort: string,
  showNsfw: boolean,
): Promise<{ pets: Pet[]; total: number; totalLikes: number }> {
  'use cache'
  cacheTag('pets')
  cacheLife('minutes')

  const supabase = createPublicClient()
  const from = (page - 1) * PER_PAGE
  const to = from + PER_PAGE - 1
  const orderCol = sort === 'liked' ? 'likes_count' : sort === 'viewed' ? 'views_count' : 'created_at'

  let query = supabase
    .from('pets')
    .select('*', { count: 'exact' })
    .eq('published', true)
    .order(orderCol, { ascending: false })
    .range(from, to)

  if (!showNsfw) query = query.eq('is_nsfw', false)

  if (q) {
    const safe = q.replace(/[%_\\]/g, '\\$&')
    query = query.or(`display_name.ilike.%${safe}%,description.ilike.%${safe}%`)
  }

  const [{ data, count }, { data: likesData }] = await Promise.all([
    query,
    supabase.from('pets').select('likes_count').eq('published', true),
  ])

  const totalLikes = (likesData ?? []).reduce((sum, p) => sum + (p.likes_count ?? 0), 0)
  return { pets: data ?? [], total: count ?? 0, totalLikes }
}
