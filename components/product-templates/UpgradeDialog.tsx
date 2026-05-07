'use client'

import { useEffect } from 'react'
import { Check, X } from 'lucide-react'

const PLANS = [
  {
    key: 'free',
    label: 'Free',
    price: '$0',
    period: 'forever',
    units: 20,
    features: ['~2 photos / month ', 'All sizes & quality'],
    cta: 'Current plan',
    ctaDisabled: true,
    popular: false,
  },
  {
    key: 'starter',
    label: 'Starter',
    price: '$9',
    period: '/ month',
    units: 500,
    features: ['~62 photos / month ', 'All sizes & quality', 'Priority support'],
    cta: 'Coming soon',
    ctaDisabled: true,
    popular: false,
  },
  {
    key: 'pro',
    label: 'Pro',
    price: '$19',
    period: '/ month',
    units: 1200,
    features: ['~150 photos / month ', 'All sizes & quality', 'Priority support'],
    cta: 'Coming soon',
    ctaDisabled: true,
    popular: true,
  },
]

export function UpgradeDialog({ onClose }: { onClose: () => void }) {
  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[200] bg-background/85 backdrop-blur-sm">
      <button type="button" className="absolute inset-0 cursor-default" aria-label="Close" onClick={onClose} />
      <div className="relative z-10 flex h-dvh items-start justify-center overflow-y-auto p-4 sm:items-center sm:p-8">
        <div className="w-full max-w-2xl overflow-hidden rounded-2xl border border-border bg-background shadow-2xl">
          <div className="flex items-start justify-between gap-4 border-b border-border px-5 py-4">
            <div>
              <p className="text-base font-semibold">Upgrade your plan</p>
              <p className="mt-0.5 text-sm text-muted-foreground">
                Unlock more product photo generations per month.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-0.5 shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid gap-3 p-5 sm:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.key}
                className={`relative flex flex-col rounded-xl border p-4 ${
                  plan.popular
                    ? 'border-foreground/25 bg-muted/40'
                    : 'border-border bg-background'
                }`}
              >
                {plan.popular && (
                  <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-full border border-violet-300 bg-violet-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-violet-700 dark:border-violet-700/50 dark:bg-violet-950/60 dark:text-violet-300">
                    Most popular
                  </span>
                )}

                <p className="text-sm font-semibold">{plan.label}</p>

                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  <span className="text-xs text-muted-foreground">{plan.period}</span>
                </div>

                <p className="mt-1 text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">{plan.units.toLocaleString()}</span> units / mo
                </p>

                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 text-xs text-muted-foreground">
                      <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-foreground/50" />
                      {feature}
                    </li>
                  ))}
                </ul>

                <button
                  type="button"
                  disabled={plan.ctaDisabled}
                  className={`mt-5 h-8 w-full rounded-lg text-xs font-medium transition-opacity ${
                    plan.key === 'free'
                      ? 'border border-border bg-background text-muted-foreground cursor-default'
                      : plan.popular
                        ? 'bg-foreground text-background opacity-40 cursor-not-allowed'
                        : 'border border-border bg-background text-muted-foreground opacity-50 cursor-not-allowed'
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          <div className="border-t border-border bg-muted/30 px-5 py-3 text-center">
            <p className="text-xs text-muted-foreground">
              Paid plans are launching soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
