'use client'

import { useEffect } from 'react'

export interface RecentDoc {
  title: string
  slug: string
  category: string
}

const KEY = 'kernel_recent_docs'
const MAX = 5

export function saveRecentDoc(doc: RecentDoc) {
  try {
    const raw = localStorage.getItem(KEY)
    const prev: RecentDoc[] = raw ? JSON.parse(raw) : []
    const filtered = prev.filter((d) => !(d.slug === doc.slug && d.category === doc.category))
    const next = [doc, ...filtered].slice(0, MAX)
    localStorage.setItem(KEY, JSON.stringify(next))
  } catch {}
}

export function getRecentDocs(): RecentDoc[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

export function DocViewTracker({ title, slug, category }: RecentDoc) {
  useEffect(() => {
    saveRecentDoc({ title, slug, category })
  }, [title, slug, category])

  return null
}
