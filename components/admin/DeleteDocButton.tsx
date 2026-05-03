'use client'

import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { ConfirmDialog } from './ConfirmDialog'

export function DeleteDocButton({ id, title }: { id: string; title: string }) {
  const router = useRouter()

  async function handleDelete() {
    const res = await fetch('/api/docs/delete', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    })
    if (res.ok) {
      toast.success(`"${title}" deleted.`)
    } else {
      toast.error('Failed to delete document.')
    }
    router.refresh()
  }

  return (
    <ConfirmDialog
      title="Delete document"
      description={`"${title}" will be permanently deleted. This cannot be undone.`}
      onConfirm={handleDelete}
    >
      <button className="p-1.5 rounded-md text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </ConfirmDialog>
  )
}
