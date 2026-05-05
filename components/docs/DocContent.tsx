import { codeToHtml } from 'shiki'
import { normalizeContent } from '@/lib/utils'
import { DocRawContent } from './DocRawContent'

interface Variable {
  name: string
  default?: string
}

interface DocContentProps {
  content: string
  variables?: Variable[]
}

const FENCE_RE = /^```(\w+)?\n([\s\S]*?)```\s*$/

function detectLang(raw: string): { lang: string; code: string } {
  const trimmed = raw.trim()
  const match = trimmed.match(FENCE_RE)
  if (match) return { lang: match[1] ?? 'text', code: match[2] }

  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    return { lang: 'json', code: raw }
  }
  
  // If it starts with frontmatter dashes, or looks like a yaml manifest
  if (trimmed.startsWith('---') || /^name:\s+/m.test(trimmed) || /^description:\s+/m.test(trimmed) || /^system_prompt:\s+/m.test(trimmed)) {
    return { lang: 'yaml', code: raw }
  }

  return { lang: 'markdown', code: raw }
}

export async function DocContent({ content, variables = [] }: DocContentProps) {
  const normalized = normalizeContent(content)
  const { lang, code } = detectLang(normalized)

  const html = await codeToHtml(code, {
    lang,
    themes: { dark: 'one-dark-pro', light: 'one-light' },
    defaultColor: false,
  })

  return <DocRawContent html={html} content={code} variables={variables} />
}
