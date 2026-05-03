'use client'

import * as Dialog from '@radix-ui/react-dialog'
import { Trash2, AlertTriangle } from 'lucide-react'

interface Props {
  title: string
  description: string
  onConfirm: () => void
  children: React.ReactNode
  confirmLabel?: string
  variant?: 'danger' | 'warning'
}

export function ConfirmDialog({ title, description, onConfirm, children, confirmLabel, variant = 'danger' }: Props) {
  const isDanger = variant === 'danger'
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-card p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95">
          <div className="flex items-start gap-4">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isDanger ? 'bg-red-500/10' : 'bg-amber-500/10'}`}>
              {isDanger
                ? <Trash2 className="h-4 w-4 text-red-500" />
                : <AlertTriangle className="h-4 w-4 text-amber-500" />
              }
            </div>
            <div className="flex-1 min-w-0">
              <Dialog.Title className="text-sm font-semibold text-foreground">{title}</Dialog.Title>
              <Dialog.Description className="mt-1 text-sm text-muted-foreground">{description}</Dialog.Description>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <Dialog.Close asChild>
              <button className="px-3.5 py-1.5 rounded-lg text-sm font-medium bg-muted text-muted-foreground hover:text-foreground transition-colors">
                Cancel
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                onClick={onConfirm}
                className={`px-3.5 py-1.5 rounded-lg text-sm font-medium text-white transition-colors ${isDanger ? 'bg-red-500 hover:bg-red-600' : 'bg-amber-500 hover:bg-amber-600'}`}
              >
                {confirmLabel ?? (isDanger ? 'Delete' : 'Discard')}
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
