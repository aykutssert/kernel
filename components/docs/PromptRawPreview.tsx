type PromptRawPreviewProps = {
  html?: string
  remaining?: number
}

export function PromptRawPreview({ html, remaining = 0 }: PromptRawPreviewProps) {
  if (!html) return null

  return (
    <div className="overflow-hidden rounded-md border border-border bg-[#F5F5F5] p-2.5 font-mono text-[11px] leading-4 dark:bg-[#262626]">
      <div
        className="doc-raw with-lines overflow-hidden [&_.line]:block [&_.line]:truncate [&_.line]:leading-4 [&_code]:block [&_pre]:m-0 [&_pre]:overflow-hidden [&_pre]:whitespace-pre [&_pre]:bg-transparent! [&_pre]:p-0"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {remaining > 0 && (
        <div className="mt-1 grid grid-cols-[2ch_1fr] gap-3 text-muted-foreground">
          <span>...</span>
          <span>+{remaining} more lines</span>
        </div>
      )}
    </div>
  )
}
