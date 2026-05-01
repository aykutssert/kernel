import { DocForm } from '@/components/admin/DocForm'
import { getAllCategories, getAllDocsMeta } from '@/lib/docs'

export default async function NewDocPage() {
  const [categories, allDocs] = await Promise.all([
    getAllCategories().catch(() => [] as string[]),
    getAllDocsMeta().catch(() => []),
  ])

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">New doc</h1>
      <DocForm categories={categories} allDocs={allDocs} />
    </div>
  )
}
