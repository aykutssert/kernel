'use client'

import { useEffect, useRef, useState } from 'react'
import { Bot, ChevronDown, MessageSquarePlus } from 'lucide-react'
import { FeedbackModal } from '@/components/feedback/FeedbackModal'
import { ConnectDialog } from '@/components/mcp/ConnectDialog'

export function MoreMenu() {
  const ref = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [connectOpen, setConnectOpen] = useState(false)

  useEffect(() => {
    if (!open) return

    function onPointerDown(event: PointerEvent) {
      if (!ref.current?.contains(event.target as Node)) {
        setOpen(false)
      }
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false)
    }

    window.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('keydown', onKeyDown)
    return () => {
      window.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  return (
    <div ref={ref} className="relative hidden md:block">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex h-8 items-center gap-1.5 rounded-lg border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
        aria-expanded={open}
      >
        More
        <ChevronDown className="h-3.5 w-3.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+8px)] z-[80] w-44 overflow-hidden rounded-lg border border-border bg-background shadow-xl">
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setFeedbackOpen(true)
            }}
            className="flex w-full items-center gap-2 border-b border-border px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageSquarePlus className="h-3.5 w-3.5" />
            Suggest
          </button>
          <button
            type="button"
            onClick={() => {
              setOpen(false)
              setConnectOpen(true)
            }}
            className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Bot className="h-3.5 w-3.5" />
            MCP
          </button>
        </div>
      )}

      <FeedbackModal isOpen={feedbackOpen} onClose={() => setFeedbackOpen(false)} />
      <ConnectDialog open={connectOpen} onOpenChange={setConnectOpen} />
    </div>
  )
}
