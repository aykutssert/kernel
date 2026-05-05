'use client'

import { useState } from 'react'
import { Bot } from 'lucide-react'
import { ConnectDialog } from './ConnectDialog'

export function ConnectButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-8 items-center gap-1.5 px-3 rounded-lg border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors shrink-0"
      >
        <Bot className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">MCP</span>
      </button>
      <ConnectDialog open={open} onOpenChange={setOpen} />
    </>
  )
}
