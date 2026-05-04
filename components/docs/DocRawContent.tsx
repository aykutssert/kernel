'use client'

import { useCallback } from 'react'

interface Variable {
  name: string
  default?: string
}

interface Props {
  html: string
  content: string
  variables: Variable[]
}

type Segment = { type: 'text'; value: string } | { type: 'var'; name: string }

function parseSegments(content: string): Segment[] {
  const parts: Segment[] = []
  const re = /\{\{(\w+)\}\}/g
  let last = 0
  let match: RegExpExecArray | null

  while ((match = re.exec(content)) !== null) {
    if (match.index > last) parts.push({ type: 'text', value: content.slice(last, match.index) })
    parts.push({ type: 'var', name: match[1] })
    last = match.index + match[0].length
  }
  if (last < content.length) parts.push({ type: 'text', value: content.slice(last) })
  return parts
}

export function DocRawContent({ html, content, variables }: Props) {
  const segments = parseSegments(content)
  const hasVars = segments.some((s) => s.type === 'var')

  const handleInput = useCallback((varName: string, e: React.FormEvent<HTMLSpanElement>) => {
    const val = e.currentTarget.textContent ?? ''
    document.querySelectorAll<HTMLSpanElement>(`[data-var="${varName}"]`).forEach((el) => {
      if (el !== e.currentTarget) el.textContent = val
    })
  }, [])

  if (!hasVars) {
    return (
      <div className="rounded-xl border border-border overflow-hidden">
        <div
          className="doc-raw text-sm leading-relaxed font-mono
            [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:m-0
            [&_pre]:p-6 [&_pre]:bg-[#F5F5F5]! dark:[&_pre]:bg-[#262626]!"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {variables.length > 0 && (
        <div className="rounded-xl border border-border p-4">
          <p className="text-sm font-semibold mb-2">Variables</p>
          <div className="flex flex-wrap gap-2">
            {variables.map((v) => (
              <span key={v.name} className="text-xs font-mono px-2 py-1 bg-muted rounded text-muted-foreground">
                {`{{${v.name}}}`}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <div className="text-sm font-mono p-6 bg-[#F5F5F5] dark:bg-[#262626] whitespace-pre-wrap break-words leading-relaxed">
          {segments.map((seg, i) =>
            seg.type === 'text' ? (
              seg.value
            ) : (
              <span
                key={i}
                data-var={seg.name}
                contentEditable
                suppressContentEditableWarning
                onInput={(e) => handleInput(seg.name, e)}
                className="inline border-b-2 border-primary/30 px-1 rounded-sm outline-none min-w-[2ch] cursor-text bg-primary/5 text-muted-foreground/70 focus:text-foreground focus:border-primary/60 transition-colors"
              >
                {seg.name}
              </span>
            )
          )}
        </div>
      </div>
    </div>
  )
}
