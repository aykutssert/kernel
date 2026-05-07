export default function LockedPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 text-center">
      <div className="max-w-sm">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Kernel
        </p>
        <h1 className="text-xl font-semibold tracking-tight">Temporarily offline</h1>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The site is paused while we work on the next version.
        </p>
      </div>
    </main>
  )
}
