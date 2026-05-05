'use client'

import { useState } from 'react'
import { MessageSquarePlus } from 'lucide-react'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackTrigger() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex h-8 items-center justify-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground shrink-0"
        title="Suggest a feature or feedback"
      >
        <MessageSquarePlus className="h-4 w-4 sm:h-3.5 sm:w-3.5" />
        <span className="hidden sm:inline text-xs font-medium">Suggest</span>
      </button>

      <FeedbackModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  )
}
