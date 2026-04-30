'use client'

import { useState } from 'react'
import { Check, Clipboard } from 'lucide-react'

export function CopyPageButton({ content }: { content: string }) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    await navigator.clipboard.writeText(content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={handleCopy}
      className="flex shrink-0 items-center gap-1.5 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground border border-border rounded-md px-3 py-1.5 transition-colors hover:bg-accent"
    >
      {copied ? (
        <>
          <Check className="w-3.5 h-3.5" />
          Copied!
        </>
      ) : (
        <>
          <Clipboard className="w-3.5 h-3.5" />
          Copy page
        </>
      )}
    </button>
  )
}
