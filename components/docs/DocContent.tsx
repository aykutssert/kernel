import { MDXRemote } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import rehypePrettyCode from 'rehype-pretty-code'
import rehypeSlug from 'rehype-slug'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

interface DocContentProps {
  content: string
}

export function DocContent({ content }: DocContentProps) {
  return (
    <div className="prose prose-lg prose-gray dark:prose-invert max-w-none">
      <MDXRemote
        source={content}
        options={{
          mdxOptions: {
            remarkPlugins: [remarkGfm],
            rehypePlugins: [
              rehypeSlug,
              [
                rehypeAutolinkHeadings,
                {
                  behavior: 'append',
                  properties: { className: ['anchor'], ariaHidden: true, tabIndex: -1 },
                  content: { type: 'text', value: '#' },
                },
              ],
              [
                rehypePrettyCode,
                {
                  theme: 'github-dark',
                  keepBackground: true,
                },
              ],
            ],
          },
        }}
      />
    </div>
  )
}
