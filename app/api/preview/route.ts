import { NextResponse } from 'next/server'
import { normalizeContent } from '@/lib/utils'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

export async function POST(req: Request) {
  const { content } = await req.json()

  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypePrettyCode, { theme: { dark: 'one-dark-pro', light: 'github-light' }, keepBackground: true })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(normalizeContent(content ?? ''))

  return NextResponse.json({ html: String(result) })
}
