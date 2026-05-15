import type { Metadata } from 'next'
import Link from 'next/link'
import { Activity, ArrowRight, Code2, GraduationCap, Mail, MapPin, PawPrint, Shirt, Sparkles, ExternalLink, Clock } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'
import { FadeInSection } from '@/components/landing/FadeInSection'
import { StaggeredGrid } from '@/components/landing/StaggeredGrid'
import { TerminalTyper } from '@/components/landing/TerminalTyper'
import { TiltCard } from '@/components/landing/TiltCard'
import { HeroTyper } from '@/components/landing/HeroTyper'
import { KitchenShowcaseLazy as KitchenShowcase, TshirtMiniPreviewLazy as TshirtMiniPreviewWrapper } from '@/components/landing/LazyDemos'

export const metadata: Metadata = {
  title: 'Aykut Sert — Portfolio',
  description: 'Full-stack developer building web apps, mobile apps, and developer tools. Next.js, Go, C#, React Native, Swift.',
}

export default async function LandingPage() {
  const docs = await getDocs()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Aykut Sert',
    jobTitle: 'Full-Stack Developer',
    url: 'https://kernelgallery.com',
    email: 'aykutssert@gmail.com',
    sameAs: [
      'https://github.com/aykutssert',
      'https://linkedin.com/in/aykut-sert-9139211b9',
    ],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'İstanbul',
      addressCountry: 'TR',
    },
    alumniOf: {
      '@type': 'EducationalOrganization',
      name: 'Gebze Technical University',
    },
    knowsAbout: [
      'C#', 'Go', 'TypeScript', 'Swift', 'Python',
      'ASP.NET Core', 'Next.js', 'SwiftUI',
      'MongoDB', 'PostgreSQL', 'Redis', 'RabbitMQ',
      'Docker', 'Microservices', 'RAG', 'LLM',
    ],
  }

  return (
    <div className="flex min-h-screen flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
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
            Full-stack · Backend · Mobile · AI
          </div>

          <h1 className="mx-auto max-w-xl text-4xl font-bold tracking-tight sm:text-5xl md:text-[3.5rem] md:leading-[1.15] min-h-[1.15em]">
            <HeroTyper className="animate-gradient hero-gradient-text bg-clip-text text-transparent" />
          </h1>

          <p className="mx-auto mt-3 text-sm text-muted-foreground/60">
            by <a href="https://github.com/aykutssert" target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors underline underline-offset-2">Aykut Sert</a>
          </p>

          <p className="mx-auto mt-4 max-w-sm text-sm leading-7 text-muted-foreground sm:max-w-md sm:text-[15px]">
            Building production-grade software across the stack — microservice backends, iOS apps, and AI integrations.
          </p>

        </div>
      </section>

      {/* ── Stack ── */}
      <section className="border-b border-border">
        <div className="mx-auto w-full max-w-[1400px] px-4 py-10 md:px-0">
          <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:flex lg:justify-between">
            {[
              {
                label: 'Languages',
                items: ['C#', 'Python', 'Go', 'TypeScript', 'Swift'],
              },
              {
                label: 'Frameworks',
                items: ['ASP.NET Core', 'Next.js', 'SwiftUI', 'React Native', 'Tailwind CSS', 'Three.js'],
              },
              {
                label: 'Data & Messaging',
                items: ['MongoDB', 'MSSQL', 'PostgreSQL', 'Redis', 'Supabase', 'RabbitMQ', 'Quartz', 'Dapper', 'Vector DB'],
              },
              {
                label: 'AI & APIs',
                items: ['OpenAI API', 'Fal AI', 'Deepgram', 'Inworld AI', 'Google Gen AI', 'LLM', 'RAG', 'Prompt Engineering', 'STT/TTS'],
              },
              {
                label: 'Architecture',
                items: ['Microservices', 'CQRS', 'Clean Architecture', 'MediatR', 'REST API', 'WebSocket'],
              },
              {
                label: 'Cloud & Infra',
                items: ['Docker', 'CI/CD', 'Vercel', 'Cloudflare', 'Railway', 'Hetzner', 'Contabo', 'Self-hosted VPS'],
              },
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
        {/* Top row: personal projects */}
        <StaggeredGrid id="projects" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" style={{ scrollMarginTop: '72px' }}>

          {/* Surge */}
          <TiltCard>
          <a
            href="https://loadtest.kernelgallery.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-orange-200 bg-orange-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-700 dark:border-orange-800/40 dark:bg-orange-950/40 dark:text-orange-300">
              <Code2 className="h-3 w-3" />
              Surge
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Distributed load tester</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                HTTP load testing engine — up to 5,000 requests, configurable concurrency, live latency percentiles.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Go · C# .NET 8 · RabbitMQ · MongoDB</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">Open</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          {/* Cadie */}
          <TiltCard>
          <a
            href="https://aykutssert.github.io/cadie/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:border-emerald-800/40 dark:bg-emerald-950/40 dark:text-emerald-300">
              <Sparkles className="h-3 w-3" />
              Cadie
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Language learning app</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Mobile app for learning new languages with spaced repetition and AI-powered feedback.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · AI</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">Open</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          {/* My Pet Routine */}
          <TiltCard>
          <a
            href="https://apps.apple.com/us/app/my-pet-routine/id6768613964"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-pink-200 bg-pink-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-pink-700 dark:border-pink-800/40 dark:bg-pink-950/40 dark:text-pink-300">
              <PawPrint className="h-3 w-3" />
              My Pet Routine
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Pet care tracker</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                iOS app on the App Store for tracking daily pet care — feeding, grooming, vet visits.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · App Store</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">App Store</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          {/* Bagcilar Mermerci */}
          <TiltCard>
          <a
            href="https://bagcilarmermerci.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-stone-700 dark:border-stone-800/40 dark:bg-stone-950/40 dark:text-stone-300">
              <Code2 className="h-3 w-3" />
              Local SEO
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Local SEO site</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Multi-district landing page structure targeting Istanbul&apos;s countertop market on Google.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Next.js · SEO · Structured Data</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">Open</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          {/* Uptime Monitor */}
          <TiltCard>
          <a
            href="https://uptime.kernelgallery.com"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
          >
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-green-700 dark:border-green-800/40 dark:bg-green-950/40 dark:text-green-300">
              <Activity className="h-3 w-3" />
              Uptime Monitor
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Self-hosted uptime monitor</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Real-time uptime monitoring dashboard — response time charts, downtime alerts, and per-minute checks.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Go · Next.js · PostgreSQL</p>
            <div className="inline-flex items-center gap-1 text-xs font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">Open</span>
              <ExternalLink className="h-3 w-3" />
            </div>
          </a>
          </TiltCard>

          {/* TripPack */}
          <TiltCard>
          <div className="flex h-full flex-col gap-3 rounded-2xl border border-border bg-background p-5 opacity-70 transition-all duration-300 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5">
            <div className="inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300">
              <Clock className="h-3 w-3" />
              TripPack
            </div>
            <div>
              <h3 className="font-semibold tracking-tight">Travel packing app <span className="ml-1.5 text-[10px] font-normal text-muted-foreground/60 uppercase tracking-wider">upcoming</span></h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                Smart packing list generator — recommendations based on destination, weather, and trip type.
              </p>
            </div>
            <p className="mt-auto text-[11px] font-mono text-muted-foreground/60">Swift · SwiftUI · AI</p>
          </div>
          </TiltCard>

        </StaggeredGrid>

        {/* Developer Toolkit */}
        <FadeInSection delay={0}>
        <Link
          href="/prompts"
          className="group mt-4 relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5 md:flex-row"
        >
          <div className="flex flex-col p-6 pb-5 md:flex-1">
            <div className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-sky-700 dark:border-sky-800/40 dark:bg-sky-950/40 dark:text-sky-300">
              <Code2 className="h-3 w-3" />
              Developer
            </div>

            <h2 className="text-xl font-bold tracking-tight">Developer toolkit</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              Full-text searchable docs system, a curated prompt library, and pixel-art Codex pets with a public REST API and npm CLI.
            </p>

            <p className="mt-4 text-[11px] font-mono text-muted-foreground/60">Next.js · Supabase · REST API · npm</p>

            <div className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
              <span className="group-hover:underline underline-offset-2">Explore</span>
              <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
            </div>
          </div>

          {/* Code terminal */}
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
                <span className="text-[10px] text-muted-foreground/60">published npm cli for one-command installs</span>
              </div>
            </div>
          </div>
        </Link>
        </FadeInSection>

        {/* ── Interactive demos ── */}
        <FadeInSection>
        <div className="mt-8">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Interactive demos</p>
          <div className="grid gap-4 md:grid-cols-2">

            {/* Kitchen Studio */}
            <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background">
              <div className="flex flex-col p-6 pb-6">
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber-700 dark:border-amber-800/40 dark:bg-amber-950/40 dark:text-amber-300">
                  <Sparkles className="h-3 w-3" />
                  Kitchen Studio
                </div>
                <h2 className="text-xl font-bold tracking-tight">AI countertop visualizer</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Upload a kitchen photo, generate realistic countertop alternatives with AI.
                </p>
              </div>
              <div className="flex flex-1 flex-col overflow-hidden border-t border-border" style={{ minHeight: 450 }}>
                <KitchenShowcase />
              </div>
            </div>

            {/* T-Shirt Studio */}
            <Link
              href="/tshirt-studio"
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-background transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
            >
              <div className="flex flex-col p-6 pb-6">
                <div className="mb-3 inline-flex w-fit items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-800/40 dark:bg-violet-950/40 dark:text-violet-300">
                  <Shirt className="h-3 w-3" />
                  T-Shirt Studio
                </div>
                <h2 className="text-xl font-bold tracking-tight">3D t-shirt designer</h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  UV canvas editor with drag, scale &amp; rotate — renders live on a real 3D shirt model with WebGL.
                </p>
              </div>
              <div className="relative flex flex-1 overflow-hidden border-t border-border bg-[#111111]" style={{ minHeight: 450 }}>
                <TshirtMiniPreviewWrapper />
                <div className="absolute left-3 bottom-3 z-10">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
                    Live demo
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>

          </div>
        </div>

        </FadeInSection>
      </main>

      {/* ── About ── */}
      <section id="about" className="border-t border-border" style={{ scrollMarginTop: '72px' }}>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-0">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">About</p>
          <StaggeredGrid className="grid gap-6 md:grid-cols-2">

            <div className="rounded-2xl border border-border bg-background p-6">
              <h2 className="text-2xl font-bold tracking-tight">Aykut Sert</h2>
              <p className="mt-1 text-sm text-muted-foreground">Full-Stack Developer</p>
              <div className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground/60">
                <MapPin className="h-3 w-3" />
                İstanbul, Turkey
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                2+ years of professional experience building microservice backends with C# and ASP.NET Core, full-stack web apps with Next.js, and iOS apps with Swift. Focused on AI integrations, distributed systems, and clean architecture.
              </p>
              <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
                <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                Gebze Technical University — Computer Engineering, 2021–2026
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-background p-6">
              <p className="mb-5 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/50">Experience</p>
              <div className="space-y-0">
                <div className="pb-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">Borusan Otomotiv</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Full-Stack Developer</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground/60">Jan 2025 – Jan 2026</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Microservice backend for a vehicle rental platform — C#, ASP.NET Core, CQRS/MediatR, RabbitMQ, Quartz.NET, Redis, MongoDB, MSSQL, Docker.
                  </p>
                </div>
                <div className="border-t border-border pt-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-sm">Negzel Teknoloji</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">Full-Stack Developer</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-mono text-muted-foreground/60">Jul 2023 – Aug 2024</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground">
                    Internal project management APIs and an RAG-based document search module — embedding, vector database, LLM integration.
                  </p>
                </div>
              </div>
            </div>

          </StaggeredGrid>
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="border-t border-border" style={{ scrollMarginTop: '72px' }}>
        <div className="mx-auto w-full max-w-[1400px] px-4 py-16 md:px-0">
          <p className="mb-8 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Contact</p>
          <StaggeredGrid className="grid gap-4 sm:grid-cols-3">

            <a
              href="mailto:aykutssert@gmail.com"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <Mail className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">Email</p>
                <p className="mt-0.5 truncate text-sm font-medium">aykutssert@gmail.com</p>
              </div>
            </a>

            <a
              href="https://github.com/aykutssert"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-muted-foreground" aria-hidden="true">
                  <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">GitHub</p>
                <p className="mt-0.5 text-sm font-medium">aykutssert</p>
              </div>
            </a>

            <a
              href="https://linkedin.com/in/aykut-sert-9139211b9"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl border border-border bg-background p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40">
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current text-muted-foreground" aria-hidden="true">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </div>
              <div>
                <p className="text-[11px] text-muted-foreground/60 uppercase tracking-wider">LinkedIn</p>
                <p className="mt-0.5 text-sm font-medium">Aykut Sert</p>
              </div>
            </a>

          </StaggeredGrid>
        </div>
      </section>

      <Footer />
    </div>
  )
}
