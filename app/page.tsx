import Link from 'next/link'
import { ArrowRight, Camera, Code2, PawPrint, Sparkles } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'
import { getProductTemplates } from '@/lib/product-templates'

export default async function LandingPage() {
  const [docs, templates] = await Promise.all([getDocs(), getProductTemplates()])
  const previewTemplates = templates.slice(0, 6)

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />

      {/* ── Hero ── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* dot grid */}
        <div
          className="absolute inset-0 dark:[--dot-color:hsl(var(--foreground)/0.12)] [--dot-color:hsl(var(--foreground)/0.18)]"
          style={{
            backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)',
            backgroundSize: '22px 22px',
          }}
        />
        {/* color glows — light mode more opaque, dark mode subtler */}
        <div className="absolute left-1/4 top-0 h-80 w-80 -translate-x-1/2 rounded-full bg-violet-400/40 blur-3xl dark:bg-violet-500/15" />
        <div className="absolute right-1/4 top-4 h-64 w-64 translate-x-1/2 rounded-full bg-sky-400/40 blur-3xl dark:bg-sky-500/15" />
        {/* vignette — transparent at top so glows show, fade to background at bottom */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-24 text-center md:px-0 md:py-32">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs text-violet-700 backdrop-blur-sm dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300">
            <Sparkles className="h-3 w-3" />
            AI-powered workflows
          </div>

          <h1 className="mx-auto max-w-xl text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] md:leading-[1.15]">
            <span
              className="animate-gradient bg-clip-text text-transparent"
              style={{
                backgroundImage:
                  'linear-gradient(90deg, #f97316, #7c3aed, #4f46e5, #2563eb, #0284c7, #06b6d4, #0ea5e9, #4f46e5, #7c3aed, #ea580c, #f97316)',
              }}
            >
              Tools that get out of the way
            </span>
          </h1>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:max-w-md sm:text-[15px]">
            Product photography and developer resources — pick a workflow, get to work.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/product-studio/templates"
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-foreground px-5 text-sm font-medium text-background transition-opacity hover:opacity-85"
            >
              Start creating
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/prompts"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/60 px-5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              Read docs
            </Link>
          </div>
        </div>
      </section>

      {/* ── Workflow cards ── */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-0 md:py-16">
        <div className="grid gap-4 md:grid-cols-2">

          {/* Product Studio */}
          <Link
            href="/product-studio/templates"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="flex flex-col p-6 pb-5">
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300">
                <Camera className="h-3 w-3" />
                Product Studio
              </div>

              <h2 className="text-xl font-bold tracking-tight">AI product photography</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Upload your product, pick a scene template, generate studio-quality photos in seconds.
              </p>

              <ul className="mt-4 space-y-1.5">
                {[
                  'Upload once, generate many variations',
                  `${templates.length} curated scene templates`,
                  'Multiple sizes & quality tiers',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-foreground/35" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Open Product Studio
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Template image grid */}
            {previewTemplates.length > 0 && (
              <div className="mt-auto grid grid-cols-3 gap-px border-t border-border bg-border">
                {previewTemplates.map((t) => (
                  <div key={t.id} className="aspect-[4/3] overflow-hidden bg-muted">
                    <img
                      src={t.image_url}
                      alt={t.name}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                    />
                  </div>
                ))}
              </div>
            )}
          </Link>

          {/* Developer */}
          <Link
            href="/prompts"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="flex flex-col p-6 pb-5">
              <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300">
                <Code2 className="h-3 w-3" />
                Developer
              </div>

              <h2 className="text-xl font-bold tracking-tight">Docs, prompts &amp; pets</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Structured reference docs, a reusable prompt library, and pixel-art companion pets accessible via REST API.
              </p>

              <ul className="mt-4 space-y-1.5">
                {[
                  'Searchable documentation with full-text search',
                  'Curated & community prompt library',
                  'Codex pets — sprites with REST API',
                ].map((f) => (
                  <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1 w-1 shrink-0 rounded-full bg-foreground/35" />
                    {f}
                  </li>
                ))}
              </ul>

              <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                Explore developer tools
                <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
              </div>
            </div>

            {/* Code terminal */}
            <div className="mt-auto border-t border-border">
              <div className="font-mono text-xs">
                <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
                  <span className="h-2 w-2 rounded-full bg-red-400" />
                  <span className="h-2 w-2 rounded-full bg-yellow-400" />
                  <span className="h-2 w-2 rounded-full bg-green-400" />
                  <span className="ml-2 text-[10px] tracking-wide text-muted-foreground/60">terminal</span>
                </div>
                <div className="space-y-1 bg-muted/20 px-4 py-4 leading-5 text-muted-foreground">
                  <p>
                    <span className="text-foreground/50">$</span>{' '}
                    <span className="text-foreground/80">curl</span>{' '}
                    /api/pets/random \
                  </p>
                  <p className="pl-4">
                    -H{' '}
                    <span className="text-foreground/55">&ldquo;Accept: image/png&rdquo;</span>{' '}
                    \
                  </p>
                  <p className="pl-4">--output pet.png</p>
                  <p className="mt-2 text-foreground/35"># returns a random Codex pet sprite</p>
                </div>
                <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2">
                  <PawPrint className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-[10px] text-muted-foreground/60">pixel-art sprites, unique per generation</span>
                </div>
              </div>
            </div>
          </Link>

        </div>
      </main>

      <Footer />
    </div>
  )
}
