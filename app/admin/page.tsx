import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Pencil, Trash2 } from 'lucide-react'
import { DeleteDocButton } from '@/components/admin/DeleteDocButton'
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

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-semibold">All docs</h1>
        <p className="text-sm text-muted-foreground">{docs.length} total</p>
      </div>

      {docs.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-sm">
          No docs yet.{' '}
          <Link href="/admin/new" className="underline underline-offset-4 hover:text-foreground">
            Create the first one.
          </Link>
        </div>
      ) : (
        <div className="border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc, i) => (
                <tr
                  key={doc.id}
                  className={i < docs.length - 1 ? 'border-b border-border' : ''}
                >
                  <td className="px-4 py-3 font-medium">{doc.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.category}</td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    {doc.slug}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        doc.published
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      {doc.published ? 'Published' : 'Draft'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Link
                        href={`/admin/edit/${doc.id}`}
                        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Link>
                      <DeleteDocButton id={doc.id} title={doc.title} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
