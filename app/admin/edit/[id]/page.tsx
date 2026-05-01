import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getAllCategories, getAllDocsMeta } from '@/lib/docs'
import { DocForm } from '@/components/admin/DocForm'
import type { Doc } from '@/types'

interface Props {
  params: Promise<{ id: string }>
}

async function getDocById(id: string): Promise<Doc | null> {
  const supabase = await createClient()
  const { data } = await supabase.from('docs').select('*').eq('id', id).single()
  return data ?? null
}

export default async function EditDocPage({ params }: Props) {
  const { id } = await params
  const [doc, categories, allDocs] = await Promise.all([
    getDocById(id),
    getAllCategories(),
    getAllDocsMeta(),
  ])

  if (!doc) notFound()

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">Edit doc</h1>
      <DocForm doc={doc} categories={categories} allDocs={allDocs} />
    </div>
  )
}
