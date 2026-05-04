export function PetsGridSkeleton() {
  return (
    <div>
      {/* Header */}
      <div className="flex items-end justify-between mb-4">
        <div>
          <div className="h-8 w-40 bg-muted animate-pulse rounded-lg mb-2" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>
        <div className="h-4 w-24 bg-muted animate-pulse rounded" />
      </div>

      {/* Search + sort */}
      <div className="flex flex-col gap-3 mb-8">
        <div className="h-9 w-full bg-muted animate-pulse rounded-lg" />
        <div className="flex items-center justify-between">
          <div className="h-8 w-56 bg-muted animate-pulse rounded-lg" />
          <div className="h-6 w-32 bg-muted animate-pulse rounded-full" />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {Array.from({ length: 15 }).map((_, i) => (
          <div key={i} className="border border-border rounded-xl overflow-hidden bg-background flex flex-col">
            {/* Canvas area */}
            <div className="aspect-square bg-muted animate-pulse" />
            {/* Card body */}
            <div className="px-3 pt-3 pb-3 flex flex-col gap-2">
              <div className="h-4 w-3/4 bg-muted animate-pulse rounded" />
              <div className="flex gap-2">
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
                <div className="h-3 w-8 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-3 w-full bg-muted animate-pulse rounded" />
              <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
            </div>
            {/* Buttons */}
            <div className="px-3 pb-3 flex gap-2">
              <div className="flex-1 h-7 bg-muted animate-pulse rounded-lg" />
              <div className="w-10 h-7 bg-muted animate-pulse rounded-lg" />
              <div className="flex-1 h-7 bg-muted animate-pulse rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
