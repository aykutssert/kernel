'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Eye, Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Pet } from '@/lib/pets'

export function PetAdminTable({ pets }: { pets: Pet[] }) {
  const router = useRouter()

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return
    await fetch('/api/pets/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    router.refresh()
  }

  return (
    <div className="border border-border rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/50">
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Name</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">ID</th>
            <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
            <th className="px-4 py-3" />
          </tr>
        </thead>
        <tbody>
          {pets.map((pet, i) => (
            <tr key={pet.id} className={i < pets.length - 1 ? 'border-b border-border' : ''}>
              <td className="px-4 py-3 font-medium">{pet.display_name}</td>
              <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{pet.id}</td>
              <td className="px-4 py-3">
                <span className={cn(
                  'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                  pet.published
                    ? 'bg-foreground text-background dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {pet.published ? 'Published' : 'Draft'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 justify-end">
                  <Link
                    href={`/admin/preview/pet/${pet.id}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    href={`/admin/pets/edit/${pet.id}`}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </Link>
                  <button
                    onClick={() => handleDelete(pet.id, pet.display_name)}
                    className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
