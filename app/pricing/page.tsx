import Link from 'next/link'
import { Check } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    units: '20',
    photos: '~2',
    features: ['All sizes & quality', 'All templates'],
    cta: 'Get started',
    ctaHref: '/product-studio/templates',
    popular: false,
    disabled: false,
  },
  {
    key: 'starter',
    label: 'Starter',
    price: '$9',
    period: '/ month',
    units: '500',
    photos: '~62',
    features: ['All sizes & quality', 'All templates', 'Priority support'],
    cta: 'Coming soon',
    ctaHref: null,
    popular: false,
    disabled: true,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$19',
    period: '/ month',
    units: '1,200',
    photos: '~150',
    features: ['All sizes & quality', 'All templates', 'Priority support'],
    cta: 'Coming soon',
    ctaHref: null,
    popular: true,
    disabled: true,
  },
]

export default async function PricingPage() {
  const docs = await getDocs()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-12 md:px-0 md:py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pricing</p>
            <h1 className="text-3xl font-bold tracking-tight">Simple, transparent pricing</h1>
            <p className="mt-3 text-sm text-muted-foreground">
              Start free. Upgrade when you need more generations.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-2xl border p-6 ${
                  plan.popular
                    ? 'border-foreground/20 bg-muted/40'
                    : 'border-border bg-background'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full border border-violet-300 bg-violet-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-700/50 dark:bg-violet-950/60 dark:text-violet-300">
                    Most popular
                  </span>
                )}

                <p className="text-sm font-semibold">{plan.label}</p>

                <div className="mt-4 flex items-baseline gap-1.5">
                  <span className="text-3xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>

                <div className="mt-3 rounded-lg bg-muted/60 px-3 py-2.5">
                  <p className="text-xs text-muted-foreground">
                    <span className="text-sm font-semibold text-foreground">{plan.units}</span> units / month
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">{plan.photos}</span> photos / month
                  </p>
                </div>

                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 shrink-0 text-foreground/50" />
                      {feature}
                    </li>
                  ))}
                </ul>

                {plan.ctaHref ? (
                  <Link
                    href={plan.ctaHref}
                    className="mt-6 flex h-9 items-center justify-center rounded-xl border border-border bg-background text-xs font-medium text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
                  >
                    {plan.cta}
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className={`mt-6 h-9 w-full cursor-not-allowed rounded-xl text-xs font-medium opacity-40 ${
                      plan.popular
                        ? 'bg-foreground text-background'
                        : 'border border-border bg-background text-muted-foreground'
                    }`}
                  >
                    {plan.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-2xl border border-border bg-muted/30 px-5 py-4">
            <p className="mb-1 text-xs font-semibold">What is a unit?</p>
            <p className="text-xs leading-5 text-muted-foreground">
              Each photo generation costs units based on size and quality. A medium-quality 1:1 photo costs 8 units.
              Low quality costs 1 unit, high quality costs 20–25 units. Units reset monthly.
            </p>
          </div>

          <div className="mt-8 rounded-2xl border border-dashed border-border px-5 py-6 text-center">
            <p className="text-sm font-medium">Paid plans launching soon</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Starter and Pro plans are on the way.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
