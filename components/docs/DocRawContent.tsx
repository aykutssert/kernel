'use client'

import { useState } from 'react'

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
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(variables.map((v) => [v.name, v.default ?? '']))
  )

  const hasVars = variables.length > 0

  let displayHtml = html
  if (hasVars) {
    displayHtml = html.replace(/\{\{(\w+)\}\}/g, (match, name) => {
      const val = values[name]
      return `<span class="var-highlight px-1 py-0.5 mx-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 font-mono text-[0.85em] leading-none">${val || name}</span>`
    })
  }

  const RawView = (
    <div className="rounded-xl border border-foreground/20 overflow-hidden">
      <div
        className="doc-raw text-[13px] leading-relaxed font-mono
          [&_pre]:whitespace-pre-wrap [&_pre]:break-words [&_pre]:m-0
          [&_pre]:p-5 [&_pre]:bg-[#F5F5F5]! dark:[&_pre]:bg-[#262626]!"
        dangerouslySetInnerHTML={{ __html: displayHtml }}
      />
    </div>
  )

  if (!hasVars) {
    return RawView
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-foreground/20 p-4 space-y-3">
        <p className="text-sm font-semibold">Variables</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {variables.map((v) => (
            <div key={v.name} className="flex flex-col gap-1 min-w-0">
              <span className="text-xs font-mono text-muted-foreground">{v.name}</span>
              <input
                type="text"
                value={values[v.name] ?? ''}
                onChange={(e) => setValues((prev) => ({ ...prev, [v.name]: e.target.value }))}
                onFocus={(e) => e.target.select()}
                placeholder={v.name}
                className="w-full px-3 py-1.5 text-sm border border-foreground/20 rounded-lg bg-background font-mono focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          ))}
        </div>
      </div>
      {RawView}
    </div>
  )
}
