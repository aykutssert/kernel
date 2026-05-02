'use client'

import { useState } from 'react'
import { Check, Copy, Terminal } from 'lucide-react'

interface Props {
  petId: string
}

export function CurlCommand({ petId }: Props) {
  const [copied, setCopied] = useState(false)

  const projectRef = 'ngsyjbwzbujmoxwrwjam'
  const command = `curl -L "https://${projectRef}.supabase.co/functions/v1/petshare/api/pets/${petId}/download" -o "/tmp/${petId}.codex-pet.zip" && mkdir -p "$HOME/.codex/pets/${petId}" && unzip -o "/tmp/${petId}.codex-pet.zip" -d "$HOME/.codex/pets/${petId}"`

  async function handleCopy() {
    await navigator.clipboard.writeText(command)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        Install via terminal
      </p>
      <div className="relative flex items-center gap-3 bg-[#111] text-[#e5e5e5] rounded-xl px-4 py-3.5 font-mono text-xs">
        <Terminal className="w-4 h-4 shrink-0 text-green-400" />
        <span className="flex-1 overflow-x-auto whitespace-nowrap scrollbar-none select-all">
          {command}
        </span>
        <button
          onClick={handleCopy}
          className="shrink-0 p-1.5 rounded-md hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
          aria-label="Copy command"
        >
          {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
    </div>
  )
}
