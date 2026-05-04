export function PromptsGridSkeleton() {
  return (
    <div className="grid gap-x-8 gap-y-3 lg:grid-cols-[240px_1fr]">
      {/* Header row */}
      <div className="flex min-h-5 items-center gap-2">
        <div className="h-3.5 w-16 animate-pulse rounded bg-muted" />
        <div className="h-3.5 w-20 animate-pulse rounded bg-muted" />
      </div>
      <div className="hidden min-h-5 lg:block" />

      {/* Sidebar */}
      <aside className="lg:sticky lg:top-[117px] lg:self-start">
        <div className="space-y-5 rounded-md border border-border bg-background p-4">
          {/* Filters header */}
          <div className="flex items-center justify-between gap-3">
            <div className="h-3.5 w-14 animate-pulse rounded bg-muted" />
            <div className="h-5 w-14 animate-pulse rounded bg-muted" />
          </div>

          {/* Search prompts */}
          <div>
            <div className="mb-1.5 h-3.5 w-24 animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
          </div>

          {/* Search tags */}
          <div>
            <div className="mb-1.5 h-3.5 w-20 animate-pulse rounded bg-muted" />
            <div className="h-8 w-full animate-pulse rounded-md bg-muted" />
            {/* Tag pills */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {Array.from({ length: 12 }).map((_, i) => (
                <div
                  key={i}
                  className="h-5 animate-pulse rounded bg-muted"
                  style={{ width: `${48 + (i % 4) * 16}px` }}
                />
              ))}
            </div>
          </div>

          {/* Sort */}
          <div>
            <div className="mb-1.5 h-3.5 w-10 animate-pulse rounded bg-muted" />
            <div className="grid grid-cols-2 gap-1.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-8 animate-pulse rounded-md border border-border bg-muted" />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Card grid */}
      <section className="min-w-0">
        <div className="columns-1 gap-4 sm:columns-2 xl:columns-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="mb-4 break-inside-avoid overflow-hidden rounded-md border border-border bg-background"
            >
              {/* Some cards with image placeholder, some without */}
              {i % 3 === 0 && (
                <div className="h-[260px] animate-pulse bg-muted" />
              )}

              <div className="p-3.5">
                {/* Title + badge */}
                <div className="flex items-start justify-between gap-3">
                  <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                  {i % 3 !== 0 && (
                    <div className="h-4 w-9 shrink-0 animate-pulse rounded-md bg-muted" />
                  )}
                </div>
                {/* Description */}
                <div className="mt-1.5 h-3 w-full animate-pulse rounded bg-muted" />

                {/* Code block */}
                <div className="mt-3 overflow-hidden rounded-md border border-border bg-[#F5F5F5] p-2.5 dark:bg-[#262626]">
                  {Array.from({ length: i % 3 === 0 ? 4 : 7 }).map((_, j) => (
                    <div key={j} className="mb-1 grid grid-cols-[2ch_1fr] gap-3">
                      <div className="h-3 w-full animate-pulse rounded bg-muted" />
                      <div
                        className="h-3 animate-pulse rounded bg-muted"
                        style={{ width: `${40 + ((j * 17) % 55)}%` }}
                      />
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {Array.from({ length: 2 + (i % 2) }).map((_, j) => (
                    <div
                      key={j}
                      className="h-5 animate-pulse rounded bg-muted"
                      style={{ width: `${40 + (j % 3) * 14}px` }}
                    />
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div className="mx-3.5 flex items-center justify-end border-t border-border py-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted" />
                  <div className="h-3.5 w-3.5 animate-pulse rounded bg-muted" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
