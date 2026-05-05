'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'
import { PromptLikeButton } from '@/components/docs/PromptLikeButton'
import { PromptRawPreview } from '@/components/docs/PromptRawPreview'
import type { LikedDoc } from '@/lib/account'

export function LikedPromptCard({
  doc,
  onUnlike,
}: {
  doc: LikedDoc
  onUnlike?: (id: string) => void
}) {
  return (
    <article className="overflow-hidden rounded-md border border-border bg-background">
      {doc.image_url ? (
        <Link href={`/docs/${doc.category}/${doc.slug}`} className="relative flex h-40 items-center justify-center overflow-hidden bg-muted">
          <div
            className="absolute inset-0 scale-110 bg-cover bg-center opacity-45 blur-xl"
            style={{ backgroundImage: `url(${doc.image_url})` }}
          />
          <img
            src={doc.image_url}
            alt={doc.title}
            loading="lazy"
            decoding="async"
            className="relative z-10 h-full w-full object-contain"
          />
        </Link>
      ) : (
        <div className="m-3.5 mb-0">
          <PromptRawPreview html={doc.preview_html} remaining={doc.preview_remaining} />
        </div>
      )}

      <div className="p-3.5">
        <div className="flex items-start justify-between gap-3">
          <Link href={`/docs/${doc.category}/${doc.slug}`} className="group/title min-w-0">
            <h2 className="truncate text-sm font-semibold leading-snug tracking-tight group-hover/title:underline group-hover/title:underline-offset-4">
              {doc.title}
            </h2>
          </Link>
          {!doc.image_url && (
            <span className="shrink-0 rounded-md border border-border bg-background px-2 py-0.5 text-[10px] font-medium text-muted-foreground">Text</span>
          )}
        </div>
        {doc.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-muted-foreground">
            {doc.description}
          </p>
        )}
      </div>

      <div className="mx-3.5 flex items-center justify-between border-t border-border py-2.5 text-muted-foreground">
        <PromptLikeButton
          docId={doc.id}
          initialCount={doc.likes_count ?? 0}
          initialLiked={doc.liked_by_me}
          compact
          onChange={(liked) => {
            if (!liked) onUnlike?.(doc.id)
          }}
        />
        <Link href={`/docs/${doc.category}/${doc.slug}`} className="transition-colors hover:text-foreground" aria-label="Open prompt">
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  )
}
