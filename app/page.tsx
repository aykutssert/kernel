import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Camera, Code2, PawPrint, Share2, Sparkles, Zap } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'
import { getProductTemplates } from '@/lib/product-templates'
import { PRODUCT_TEMPLATE_CATEGORIES } from '@/lib/product-template-categories'
import { BeforeAfterShowcase } from '@/components/landing/BeforeAfterShowcase'
import { FadeInSection } from '@/components/landing/FadeInSection'
import type { ProductTemplate } from '@/types'

function pickShowcaseTemplates(templates: ProductTemplate[], count = 4) {
  const seen = new Set<string>()
  const result: ProductTemplate[] = []
  // first pass: one per category for variety
  for (const t of templates) {
    if (!seen.has(t.category) && result.length < count) {
      seen.add(t.category)
      result.push(t)
    }
  }
  // second pass: fill remaining slots with any leftover templates
  if (result.length < count) {
    const picked = new Set(result.map((t) => t.id))
    for (const t of templates) {
      if (!picked.has(t.id) && result.length < count) {
        result.push(t)
        picked.add(t.id)
      }
    }
  }
  return result
}

export const metadata: Metadata = {
  title: 'AI Product Photography & Developer Tools',
  description: 'Product Studio for AI-generated product photos and a developer toolkit with prompts, docs, and Codex pets.',
}

export default async function LandingPage() {
  const [docs, templates] = await Promise.all([getDocs(), getProductTemplates()])
  const showcaseTemplates = pickShowcaseTemplates(templates, 4)

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
        <div className="animate-glow-a absolute left-0 top-0 h-72 w-72 -translate-x-1/4 rounded-full bg-violet-400/40 blur-3xl dark:bg-violet-500/15 sm:h-80 sm:w-80 sm:left-1/4 sm:-translate-x-1/2" />
        <div className="animate-glow-b absolute right-0 top-4 h-56 w-56 translate-x-1/4 rounded-full bg-sky-400/40 blur-3xl dark:bg-sky-500/15 sm:h-64 sm:w-64 sm:right-1/4 sm:translate-x-1/2" />
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
              <Zap className="h-4 w-4" />
              <span className="sm:hidden">Start creating</span>
              <span className="hidden sm:inline">Studio-quality product photos, instantly</span>
            </Link>
            <Link
              href="/prompts"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-border bg-background/60 px-5 text-sm font-medium text-muted-foreground backdrop-blur-sm transition-colors hover:border-foreground/25 hover:text-foreground"
            >
              See how it works
            </Link>
          </div>
        </div>
      </section>

      {/* ── Stats strip ── */}
      <div className="border-b border-border bg-muted/30">
        <div className="mx-auto flex w-full max-w-[1400px] flex-wrap items-center justify-center gap-x-8 gap-y-1 px-4 py-3 md:px-0">
          {[
            { icon: '✦', text: `${templates.length} scene templates` },
            { icon: '✦', text: 'Free to start' },
            { icon: '✦', text: 'Generate in seconds' },
          ].map(({ icon, text }) => (
            <span key={text} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="text-[10px] text-foreground/20">{icon}</span>
              {text}
            </span>
          ))}
        </div>
      </div>

      {/* ── Workflow cards ── */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-0 md:py-16">
        <FadeInSection>
        <div className="grid gap-4 md:grid-cols-2">

          {/* Product Studio */}
          <Link
            href="/product-studio/templates"
            className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="flex flex-1 flex-col p-6 pb-5">
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

            {/* Before / After showcase */}
            <div className="overflow-hidden border-t border-border">
              <div className="flex items-center justify-between bg-muted/30 px-4 py-2">
                <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Before &amp; After</span>
                <span className="text-[10px] text-muted-foreground/60">click to pause</span>
              </div>
              <BeforeAfterShowcase
                beforeSrc="/product-workflow-before.webp"
                afterSrc="/product-workflow-example.webp"
              />
            </div>
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

              {/* Code terminal */}
              <div className="mt-5 overflow-hidden rounded-xl border border-border font-mono text-xs">
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

          {/* Social Media — Coming Soon */}
          <div className="mt-4 flex items-start justify-between gap-3 rounded-2xl border border-dashed border-border bg-muted/20 px-5 py-4 opacity-70 sm:items-center sm:px-6 sm:py-5">
            <div className="flex items-start gap-3 sm:items-center sm:gap-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border bg-background">
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <p className="text-sm font-semibold">Social Media Workflow</p>
                  <span className="rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-600 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-400">
                    Coming soon
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  Turn your products into content for Instagram, TikTok, and more.
                </p>
              </div>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground/40 sm:mt-0" />
          </div>

        </FadeInSection>
      </main>

      {/* ── Scene gallery ── */}
      {showcaseTemplates.length > 0 && (
        <section className="border-t border-border">
          <div className="mx-auto w-full max-w-[1400px] px-4 py-12 md:px-0 md:py-16">
            <FadeInSection>
            <div className="mb-8 flex items-end justify-between">
              <div>
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Scene templates
                </p>
                <h2 className="text-2xl font-bold tracking-tight">What can you create?</h2>
                <p className="mt-2 max-w-md text-sm text-muted-foreground">
                  Choose a scene, upload your product — get a studio-quality photo in seconds.
                </p>
              </div>
              <Link
                href="/product-studio/templates"
                className="hidden shrink-0 items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground sm:inline-flex"
              >
                Browse all {templates.length} templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {showcaseTemplates.map((t, i) => (
                <FadeInSection key={t.id} delay={i * 80}>
                  <Link
                    href="/product-studio/templates"
                    className="group relative block overflow-hidden rounded-xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-lg hover:shadow-foreground/5"
                  >
                    <div className="aspect-[3/4] overflow-hidden bg-muted">
                      <img
                        src={t.image_url}
                        alt={t.name}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      />
                    </div>
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent p-4 pt-10">
                      <p className="text-xs font-semibold text-white">{t.name}</p>
                      <p className="mt-0.5 text-[11px] text-white/60">
                        {PRODUCT_TEMPLATE_CATEGORIES.find((c) => c.value === t.category)?.label}
                      </p>
                    </div>
                  </Link>
                </FadeInSection>
              ))}
            </div>

            <div className="mt-5 text-center sm:hidden">
              <Link
                href="/product-studio/templates"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
              >
                Browse all {templates.length} templates
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            </FadeInSection>
          </div>
        </section>
      )}

      <Footer />
    </div>
  )
}
