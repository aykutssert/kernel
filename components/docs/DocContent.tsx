import { normalizeContent } from '@/lib/utils'
import { unified } from 'unified'
import remarkParse from 'remark-parse'
import remarkGfm from 'remark-gfm'
import remarkRehype from 'remark-rehype'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeStringify from 'rehype-stringify'

interface DocContentProps {
  content: string
}

export async function DocContent({ content }: DocContentProps) {
  const result = await unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype, { allowDangerousHtml: true })
    .use(rehypeSlug)
    .use(rehypeAutolinkHeadings, {
      behavior: 'append',
      properties: { className: ['anchor'], ariaHidden: true, tabIndex: -1 },
      content: { type: 'text', value: '#' },
    })
    .use(rehypePrettyCode, {
      theme: { dark: 'one-dark-pro', light: 'github-light' },
      keepBackground: true,
    })
    .use(rehypeStringify, { allowDangerousHtml: true })
    .process(normalizeContent(content))

  return (
    <div
      className="prose prose-lg max-w-none prose-p:leading-7 prose-p:text-base"
      dangerouslySetInnerHTML={{ __html: String(result) }}
    />
  )
}
