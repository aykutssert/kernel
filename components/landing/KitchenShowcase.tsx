'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

const OPTIONS = [
  { key: 'before', label: 'Original', src: '/kitchen/before.jpg' },
  { key: 'after_1', label: 'Option 1', src: '/kitchen/after_1.png' },
  { key: 'after_2', label: 'Option 2', src: '/kitchen/after_2.png' },
  { key: 'after_3', label: 'Option 3', src: '/kitchen/after_3.png' },
]

function KitchenLightbox({ src, label, onClose }: { src: string; label: string; onClose: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return createPortal(
    <div className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <button type="button" className="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-w-4xl w-full">
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 rounded-md p-1.5 text-white/70 hover:text-white transition-colors"
          aria-label="Close preview"
        >
          <X className="h-5 w-5" />
        </button>
        <img
          src={src}
          alt={label}
          className="w-full rounded-xl object-contain max-h-[80dvh]"
        />
        <p className="mt-3 text-center text-sm text-white/60">{label}</p>
      </div>
    </div>,
    document.body
  )
}

export function KitchenShowcase() {
  const [active, setActive] = useState('before')
  const [lightbox, setLightbox] = useState(false)
  const current = OPTIONS.find((o) => o.key === active)!

  return (
    <>
      <div className="flex flex-1 flex-col">
        {/* Main image — clickable */}
        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="relative flex-1 overflow-hidden bg-muted cursor-zoom-in"
        >
          {OPTIONS.map((opt) => (
            <img
              key={opt.key}
              src={opt.src}
              alt={opt.label}
              className="absolute inset-0 h-full w-full object-cover"
              style={{
                opacity: active === opt.key ? 1 : 0,
                transition: 'opacity 400ms ease-in-out',
              }}
            />
          ))}
          <div className="absolute left-3 bottom-3 z-10">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: active === 'before' ? '#f97316' : '#4ade80' }}
              />
              {current.label}
            </span>
          </div>
        </button>

        {/* Thumbnail selector */}
        <div className="flex gap-2 border-t border-border p-3">
          {OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              onClick={() => setActive(opt.key)}
              className="relative flex-1 overflow-hidden rounded-lg transition-all"
              style={{
                outline: active === opt.key ? '2px solid hsl(var(--foreground))' : '2px solid transparent',
                outlineOffset: 2,
                opacity: active === opt.key ? 1 : 0.5,
              }}
            >
              <img
                src={opt.src}
                alt={opt.label}
                className="h-14 w-full object-cover hover:opacity-100 transition-opacity"
              />
            </button>
          ))}
        </div>
      </div>

      {lightbox && (
        <KitchenLightbox src={current.src} label={current.label} onClose={() => setLightbox(false)} />
      )}
    </>
  )
}
