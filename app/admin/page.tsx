import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { DocTable } from '@/components/admin/DocTable'
import type { Doc } from '@/types'

async function getAllDocs(): Promise<Doc[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('docs')
    .select('*')
    .order('category')
    .order('order_index')
  return data ?? []
}

export default async function AdminPage() {
  const docs = await getAllDocs()

  if (docs.length === 0) {
    return (
      <div className="text-center py-20 text-muted-foreground text-sm">
        No docs yet.{' '}
        <Link href="/admin/new" className="underline underline-offset-4 hover:text-foreground">
          Create the first one.
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">All docs</h1>
      <DocTable docs={docs} />
    </div>
  )
}
