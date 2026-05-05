'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MessageSquare, Send, X, Loader2, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function FeedbackModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [content, setContent] = useState('')
  const [author, setAuthor] = useState('')
  const [source, setSource] = useState('Site')
  const [honeypot, setHoneypot] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const backdropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (honeypot) { onClose(); return }
    if (!content.trim()) return

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, author_name: author || 'Anonymous', source }),
      })

      if (!res.ok) throw new Error('Failed to send feedback')

      setSuccess(true)
      setTimeout(() => {
        setSuccess(false)
        setContent('')
        setAuthor('')
        onClose()
      }, 2000)
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={(e) => { if (e.target === backdropRef.current) onClose() }}
    >
      <div className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl border border-border bg-background shadow-2xl animate-in fade-in zoom-in duration-200 no-scrollbar">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-border px-4 py-3.5 bg-background/95 backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-foreground/5 text-foreground">
              <MessageSquare className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-tight">Suggest a Feature</span>
          </div>
          <button onClick={onClose} className="rounded-full p-2 hover:bg-muted transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          {/* Honeypot */}
          <input 
            type="text" 
            value={honeypot} 
            onChange={(e) => setHoneypot(e.target.value)} 
            className="hidden" 
            tabIndex={-1} 
            autoComplete="off" 
          />

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
              Content
            </label>
            <textarea
              autoFocus
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Features you want, bugs you found, or general feedback..."
              className="min-h-[140px] w-full resize-none bg-muted/30 text-sm outline-none placeholder:text-muted-foreground/40 border border-border rounded-xl p-4 focus:border-foreground/30 focus:bg-background transition-all"
              required
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Author
              </label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Anonymous"
                className="w-full bg-muted/30 text-sm outline-none border border-border rounded-xl px-4 py-2.5 focus:border-foreground/30 focus:bg-background transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/70">
                Source
              </label>
              <div className="relative">
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full appearance-none bg-muted/30 text-sm outline-none border border-border rounded-xl px-4 py-2.5 pr-10 focus:border-foreground/30 focus:bg-background transition-all"
                >
                  <option value="Site">Website</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Twitter">Twitter (X)</option>
                  <option value="Other">Other</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {error && <p className="text-xs text-destructive text-center">{error}</p>}

          <button
            type="submit"
            disabled={loading || success || !content.trim()}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all duration-300",
              success 
                ? "bg-green-500 text-white" 
                : "bg-foreground text-background hover:opacity-90 disabled:opacity-50"
            )}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : success ? (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Sent Successfully!
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Submit Suggestion
              </>
            )}
          </button>
        </form>
      </div>
    </div>,
    document.body
  )
}
