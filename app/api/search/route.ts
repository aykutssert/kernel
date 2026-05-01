import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

function snippet(content: string, query: string, len = 140): string {
  const lower = content.toLowerCase()
  const idx = lower.indexOf(query.toLowerCase())
  if (idx === -1) return content.slice(0, len) + (content.length > len ? '…' : '')
  const start = Math.max(0, idx - 50)
  const end = Math.min(content.length, idx + 90)
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''
  const safe = q.replace(/[%_\\]/g, '\\$&')

  const supabase = await createClient()

  const base = supabase
    .from('docs')
    .select('id, title, category, slug, content')
    .eq('published', true)
    .limit(8)

  const { data } = await (q
    ? base.or(`title.ilike.%${safe}%,content.ilike.%${safe}%`)
    : base.order('order_index'))

  return NextResponse.json(
    (data ?? []).map((doc) => ({
      id: doc.id,
      title: doc.title,
      category: doc.category,
      slug: doc.slug,
      snippet: q ? snippet(doc.content ?? '', q) : null,
    }))
  )
}
