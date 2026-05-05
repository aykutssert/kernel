import { codeToHtml } from 'shiki'
import { detectLang } from '@/components/docs/DocContent'
import { normalizeContent } from '@/lib/utils'
import type { TaggedDoc } from '@/types'

export type TaggedDocWithPreview = TaggedDoc & {
  preview_html?: string
  preview_remaining?: number
}

function previewCode(content: string, maxLines: number) {
  const normalized = normalizeContent(content)
  const { lang, code } = detectLang(normalized)
  const rawLines = code.trim().split('\n').filter((line) => line.trim())
  const lines = rawLines.length <= 2
    ? rawLines.flatMap((line) => wrapTextLine(line))
    : rawLines
  const preview = lines.slice(0, maxLines).join('\n')
  const remaining = Math.max(0, lines.length - maxLines)

  return {
    lang,
    code: preview || code.slice(0, 240),
    remaining,
  }
}

function wrapTextLine(line: string, maxChars = 58) {
  const words = line.trim().split(/\s+/)
  const wrapped: string[] = []
  let current = ''

  for (const word of words) {
    const next = current ? `${current} ${word}` : word
    if (next.length > maxChars && current) {
      wrapped.push(current)
      current = word
    } else {
      current = next
    }
  }

  if (current) wrapped.push(current)
  return wrapped
}

export async function renderPromptPreview(content: string, maxLines: number) {
  const { lang, code, remaining } = previewCode(content, maxLines)

  let html = await codeToHtml(code, {
    lang,
    themes: { dark: 'one-dark-pro', light: 'one-light' },
    defaultColor: false,
  })

  html = html
    .replace(/#abb2bf/gi, 'hsl(var(--foreground))')
    .replace(/#383a42/gi, 'hsl(var(--foreground))')

  return {
    preview_html: html,
    preview_remaining: remaining,
  }
}

export async function withPromptPreviews<T extends TaggedDoc>(
  docs: T[],
  maxLines: (doc: T) => number,
): Promise<(T & TaggedDocWithPreview)[]> {
  return Promise.all(
    docs.map(async (doc) => ({
      ...doc,
      ...(await renderPromptPreview(doc.content, maxLines(doc))),
    }))
  )
}
