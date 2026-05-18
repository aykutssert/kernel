'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Activity, ArrowRight, Code2, GraduationCap, Mail, MapPin, PawPrint, Shirt, Sparkles, ExternalLink, ChevronDown, BookOpen } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { FadeInSection } from './FadeInSection'
import { StaggeredGrid } from './StaggeredGrid'
import { TerminalTyper } from './TerminalTyper'
import { TiltCard } from './TiltCard'
import { HeroTyper } from './HeroTyper'
import { KitchenShowcaseLazy as KitchenShowcase } from './LazyDemos'
import type { DocMeta } from '@/types'

type RecentPrompt = {
  id: string
  title: string
  slug: string
  description: string | null
  tags: string[] | null
}

type Props = {
  docs: DocMeta[]
  recentPrompts: RecentPrompt[]
}

export function LandingClient({ docs, recentPrompts }: Props) {
  const t = useTranslations('landing')

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />

      <section className="relative overflow-hidden border-b border-border">
        <div
          className="absolute inset-0 dark:[--dot-color:hsl(var(--foreground)/0.12)] [--dot-color:hsl(var(--foreground)/0.18)]"
          style={{ backgroundImage: 'radial-gradient(circle, var(--dot-color) 1px, transparent 1px)', backgroundSize: '22px 22px' }}
        />
        <div className="animate-glow-a absolute left-0 top-0 h-72 w-72 -translate-x-1/4 rounded-full bg-violet-400/40 blur-3xl dark:bg-violet-500/15 sm:h-80 sm:w-80 sm:left-1/4 sm:-translate-x-1/2" />
        <div className="animate-glow-b absolute right-0 top-4 h-56 w-56 translate-x-1/4 rounded-full bg-sky-400/40 blur-3xl dark:bg-sky-500/15 sm:h-64 sm:w-64 sm:right-1/4 sm:translate-x-1/2" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

        <div className="relative mx-auto w-full max-w-[1400px] px-4 py-24 text-center md:px-0 md:py-32">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground backdrop-blur-sm">
            <Sparkles className="h-3 w-3" />
            {t('hero.badge')}
          </div>

          <h1 className="mx-auto max-w-xl text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] md:leading-[1.15] min-h-[1.15em]">
            <HeroTyper className="animate-gradient hero-gradient-text bg-clip-text text-transparent" />
          </h1>

          <p className="mx-auto mt-3 text-sm text-muted-foreground/60">
            {t('hero.by')} <a href="https://github.com/aykutssert" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline underline-offset-2">Aykut Sert</a>
          </p>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:max-w-md sm:text-[15px]">
            {t('hero.description')}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#projects"
              className="inline-flex items-center gap-1.5 rounded-xl bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-opacity hover:opacity-80"
            >
              {t('hero.cta_projects')}
              <ChevronDown className="h-3.5 w-3.5" />
            </a>
            <a
              href="#contact"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40"
            >
              {t('hero.cta_contact')}
              <ArrowRight className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </section>

      {/* ── Identity bar ── */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-4 md:px-0">
          <div className="flex items-center gap-3">
            <Image
              src="/my-face.jpeg"
              alt="Aykut Sert"
              width={44}
              height={44}
              priority
              sizes="44px"
              className="rounded-full object-cover ring-2 ring-border shrink-0"
            />
            <div>
              <p className="text-sm font-semibold">Aykut Sert</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {t('identity.role')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stack ── */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between">
            {[
              { label: t('stack.languages'), items: ['C#', 'Python', 'Go', 'TypeScript', 'Swift'] },
              { label: t('stack.frameworks'), items: ['ASP.NET Core', 'Entity Framework', 'SignalR', 'Next.js', 'SwiftUI', 'React Native', 'Tailwind CSS', 'Three.js'] },
              { label: t('stack.data'), items: ['MongoDB', 'MSSQL', 'PostgreSQL', 'Redis', 'Supabase', 'RabbitMQ', 'Quartz', 'Dapper', 'Vector DB'] },
              { label: t('stack.ai'), items: ['OpenAI API', 'Fal AI', 'Deepgram', 'Inworld AI', 'Google Gen AI', 'LLM', 'RAG', 'Prompt Engineering', 'STT/TTS'] },
              { label: t('stack.architecture'), items: ['Microservices', 'CQRS', 'Clean Architecture', 'MediatR', 'REST API', 'WebSocket'] },
              { label: t('stack.cloud'), items: ['Docker', 'CI/CD', 'Vercel', 'Cloudflare', 'Railway', 'Hetzner', 'Contabo', 'Self-hosted VPS'] },
            ].map(({ label, items }) => (
              <div key={label}>
                <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">
                  {label}
                </p>
                <ul className="space-y-1.5">
                  {items.map((item) => (
                    <li key={item} className="text-sm text-muted-foreground cursor-default transition-all duration-150 hover:text-foreground hover:translate-x-1">
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Projects ── */}
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-0 md:py-16">
        <StaggeredGrid id="projects" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ scrollMarginTop: '72px' }}>

          <TiltCard>
          <a href="https://apps.apple.com/us/app/my-pet-routine/id6768613964" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/mypetroutine.png" alt="My Pet Routine" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-pink-700 dark:border-pink-800/40 dark:bg-pink-950/40 dark:text-pink-300">
                <PawPrint className="h-3 w-3" />
                My Pet Routine
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.mypetroutine.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.mypetroutine.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · App Store</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.app_store')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          <TiltCard>
          <a href="https://aykutssert.github.io/flamy-web/" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/flamy.png" alt="Flamy" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300">
                <Sparkles className="h-3 w-3" />
                Flamy
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.flamy.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.flamy.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · SwiftData</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.open')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          <TiltCard>
          <a href="https://aykutssert.github.io/trippack-web/" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/trippack.png" alt="TripPack" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300">
                <Sparkles className="h-3 w-3" />
                TripPack
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.trippack.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.trippack.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · AI</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.open')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          <TiltCard>
          <a href="https://aykutssert.github.io/cadie/" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/cadie.png" alt="Cadie" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
                <Sparkles className="h-3 w-3" />
                Cadie
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.cadie.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.cadie.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · AI</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.open')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          <TiltCard>
          <a href="https://uptime.kernelgallery.com" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/uptime.svg" alt="Uptime Monitor" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" unoptimized />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-green-700 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-300">
                <Activity className="h-3 w-3" />
                Uptime Monitor
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.uptime.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.uptime.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Go · Next.js · PostgreSQL</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.open')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          <TiltCard>
          <a href="https://bagcilarmermerci.com/" target="_blank" rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="flex items-center gap-3">
              <Image src="/logo/localseo.png" alt="Local SEO" width={40} height={40} sizes="40px" className="rounded-xl shrink-0" />
              <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-700 dark:border-stone-500/50 dark:bg-stone-800/40 dark:text-stone-300">
                <Code2 className="h-3 w-3" />
                Local SEO
              </div>
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">{t('projects.localseo.title')}</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{t('projects.localseo.description')}</p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Next.js · SEO · Structured Data</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('projects.open')}</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

        </StaggeredGrid>

        {/* ── In progress ── */}
        <div className="mt-4 rounded-2xl border border-border bg-background px-5 py-4">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">{t('in_progress.label')}</p>
          <div className="flex flex-wrap gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <Image src="/logo/securebank.svg" alt="SecureBank" width={32} height={32} sizes="32px" className="rounded-lg shrink-0" unoptimized />
              <div>
                <p className="text-sm font-medium">SecureBank</p>
                <p className="text-xs text-muted-foreground">{t('in_progress.securebank')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <Image src="/logo/surge.png" alt="Surge" width={32} height={32} sizes="32px" className="rounded-lg shrink-0" />
              <div>
                <p className="text-sm font-medium">Surge</p>
                <p className="text-xs text-muted-foreground">{t('in_progress.surge')}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Developer Toolkit */}
        <FadeInSection delay={0}>
        <Link href="/prompts"
          className="group mt-4 relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5 md:flex-row">
          <div className="flex flex-col p-6 pb-5 md:flex-1">
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300">
              <Code2 className="h-3 w-3" />
              {t('toolkit.badge')}
            </div>
            <h2 className="text-xl font-bold tracking-tight">{t('toolkit.title')}</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('toolkit.description')}</p>
            <p className="mt-4 text-[11px] font-mono text-muted-foreground/60">Next.js · Supabase · REST API · npm</p>
            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">{t('toolkit.explore')}</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>
          <div className="p-6 md:w-80 md:border-l border-t md:border-t-0 border-border flex flex-col justify-center">
            <div className="overflow-hidden rounded-xl border border-border font-mono text-xs">
              <div className="flex items-center gap-1.5 border-b border-border bg-muted/40 px-4 py-2.5">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-yellow-400" />
                <span className="h-2 w-2 rounded-full bg-green-400" />
                <span className="ml-2 text-[10px] tracking-wide text-muted-foreground/60">terminal</span>
              </div>
              <TerminalTyper />
              <div className="flex items-center gap-2 border-t border-border bg-muted/40 px-4 py-2">
                <PawPrint className="h-3 w-3 text-muted-foreground/50" />
                <span className="text-[10px] text-muted-foreground/60">{t('toolkit.npm_cli')}</span>
              </div>
            </div>
          </div>
        </Link>
        </FadeInSection>

        {/* ── Blog posts ── */}
        {recentPrompts.length > 0 && (
          <FadeInSection>
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('blog.latest')}</p>
              <Link href="/prompts" className="inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground">
                {t('blog.all')} <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recentPrompts.map((post) => (
                <Link key={post.id} href={`/docs/prompts/${post.slug}`}
                  className="group flex flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
                  <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300">
                    <BookOpen className="h-3 w-3" />
                    {t('blog.post_label')}
                  </div>
                  <div>
                    <h3 className="font-semibold tracking-tight line-clamp-2">{post.title}</h3>
                    {post.description && (
                      <p className="mt-1.5 text-sm leading-6 text-muted-foreground line-clamp-2">{post.description}</p>
                    )}
                  </div>
                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span key={tag} className="rounded-md border border-border bg-muted/40 px-1.5 py-0.5 text-[10px] text-muted-foreground/70">{tag}</span>
                      ))}
                    </div>
                  )}
                  <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
                    <span className="group-hover:underline underline-offset-2">{t('blog.read')}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
          </FadeInSection>
        )}
      </main>

      {/* ── About ── */}
      <section id="about" className="border-t border-border" style={{ scrollMarginTop: '72px' }}>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-0">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('about.label')}</p>
          <StaggeredGrid className="grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-border bg-background p-6">
              <div className="flex items-center gap-4">
                <Image src="/my-face.jpeg" alt="Aykut Sert" width={64} height={64} sizes="64px" className="rounded-full object-cover ring-2 ring-border shrink-0" />
                <div>
                  <h2 className="text-2xl font-bold tracking-tight">Aykut Sert</h2>
                  <p className="mt-0.5 text-sm text-muted-foreground">{t('about.role')}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                    <MapPin className="h-3 w-3" />
                    {t('about.location')}
                  </div>
                </div>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">{t('about.bio')}</p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                {t('about.education')}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">{t('about.experience.label')}</p>
              <div className="space-y-0">
                <div className="pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">Borusan Otomotiv</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t('about.experience.borusan_role')}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground/60">Jan 2025 – Jan 2026</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('about.experience.borusan_desc')}</p>
                </div>
                <div className="border-t border-border pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">Negzel Teknoloji</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">{t('about.experience.negzel_role')}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground/60">Jul 2023 – Aug 2024</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">{t('about.experience.negzel_desc')}</p>
                </div>
              </div>
            </div>
          </StaggeredGrid>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="border-t border-border" style={{ scrollMarginTop: '72px' }}>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-0">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('contact.label')}</p>
          <StaggeredGrid className="grid gap-4 sm:grid-cols-3">
            <a href="mailto:aykutssert@gmail.com"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">{t('contact.email')}</p>
                <p className="mt-0.5 truncate text-sm font-medium">aykutssert@gmail.com</p>
              </div>
            </a>

            <a href="https://github.com/aykutssert" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-muted-foreground" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">{t('contact.github')}</p>
                <p className="mt-0.5 text-sm font-medium">aykutssert</p>
              </div>
            </a>

            <a href="https://linkedin.com/in/aykut-sert-9139211b9" target="_blank" rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-muted-foreground" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">{t('contact.linkedin')}</p>
                <p className="mt-0.5 text-sm font-medium">Aykut Sert</p>
              </div>
            </a>
          </StaggeredGrid>
        </div>
      </section>

      {/* ── Interactive demos ── */}
      <section className="border-t border-border">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-0">
          <FadeInSection>
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{t('demos.title')}</p>
          <div className="grid gap-4 md:grid-cols-2">

            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex flex-col p-6 pb-6">
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                  <Sparkles className="h-3 w-3" />
                  {t('demos.kitchen.badge')}
                </div>
                <h2 className="text-xl font-bold tracking-tight">{t('demos.kitchen.title')}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('demos.kitchen.description')}</p>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden border-t border-border" style={{ minHeight: 450 }}>
                <KitchenShowcase />
              </div>
            </div>

            <Link href="/tshirt-studio"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
              <div className="flex flex-col p-6 pb-6">
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300">
                  <Shirt className="h-3 w-3" />
                  {t('demos.tshirt.badge')}
                </div>
                <h2 className="text-xl font-bold tracking-tight">{t('demos.tshirt.title')}</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{t('demos.tshirt.description')}</p>
              </div>
              <div className="relative flex flex-1 overflow-hidden border-t border-border bg-[#111111]" style={{ minHeight: 450 }}>
                <div className="flex items-center justify-center h-full w-full">
                  <Shirt className="w-20 h-20 text-white/15" />
                </div>
                <div className="absolute left-3 bottom-3 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    {t('demos.tshirt.live')}
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>

          </div>
          </FadeInSection>
        </div>
      </section>

      <Footer />
    </div>
  )
}
