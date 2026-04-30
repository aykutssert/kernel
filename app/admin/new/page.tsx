import { DocForm } from '@/components/admin/DocForm'
import { getAllCategories } from '@/lib/docs'

export default async function NewDocPage() {
  let categories: string[] = []
  try {
    categories = await getAllCategories()
  } catch {}

  return (
    <div>
      <h1 className="text-xl font-semibold mb-6">New doc</h1>
      <DocForm categories={categories} />
    </div>
  )
}
