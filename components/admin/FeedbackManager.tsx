'use client'

import { useState } from 'react'
import { Check, X, Trash2, Star, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Feedback {
  id: string
  author_name: string
  content: string
  source: string
  status: 'pending' | 'published' | 'archived'
  is_featured: boolean
  created_at: string
}

export function FeedbackManager({ initialData }: { initialData: Feedback[] }) {
  const [data, setData] = useState(initialData)

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/feedback`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status })
    })
    if (res.ok) {
      setData(prev => prev.map(item => item.id === id ? { ...item, status: status as any } : item))
    }
  }

  const toggleFeatured = async (id: string, current: boolean) => {
    const res = await fetch(`/api/admin/feedback`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_featured: !current })
    })
    if (res.ok) {
      setData(prev => prev.map(item => item.id === id ? { ...item, is_featured: !current } : item))
    }
  }

  const deleteFeedback = async (id: string) => {
    if (!confirm('Are you sure you want to delete this feedback?')) return
    const res = await fetch(`/api/admin/feedback`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    })
    if (res.ok) {
      setData(prev => prev.filter(item => item.id !== id))
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold tracking-tight">User Feedback</h2>
        <div className="text-xs text-muted-foreground uppercase tracking-widest">
          {data.length} total entries
        </div>
      </div>

      <div className="grid gap-4">
        {data.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center border border-dashed rounded-xl">
            <MessageSquare className="h-8 w-8 text-muted-foreground/30 mb-2" />
            <p className="text-sm text-muted-foreground">No feedback found.</p>
          </div>
        ) : (
          data.map((item) => (
            <div 
              key={item.id} 
              className={cn(
                "group relative overflow-hidden rounded-xl border p-4 transition-all hover:shadow-md",
                item.status === 'pending' ? "border-amber-200 bg-amber-50/20 dark:border-amber-900/50" : "bg-card"
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold">{item.author_name}</span>
                    <span className="text-[10px] rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground">
                      {item.source}
                    </span>
                    {item.status === 'pending' && (
                      <span className="text-[10px] rounded-full bg-amber-100 text-amber-700 px-2 py-0.5 font-semibold uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-foreground/80 italic">
                    "{item.content}"
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  {item.status === 'pending' ? (
                    <button 
                      onClick={() => updateStatus(item.id, 'published')}
                      className="p-2 rounded-lg bg-green-500/10 text-green-600 hover:bg-green-500 hover:text-white transition-all"
                      title="Approve & Publish"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => updateStatus(item.id, 'archived')}
                      className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-all"
                      title="Archive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  
                  <button 
                    onClick={() => toggleFeatured(item.id, item.is_featured)}
                    className={cn(
                      "p-2 rounded-lg transition-all",
                      item.is_featured ? "bg-amber-500 text-white" : "hover:bg-muted text-muted-foreground"
                    )}
                    title={item.is_featured ? "Unfeature" : "Feature on top"}
                  >
                    <Star className="h-4 w-4" />
                  </button>

                  <button 
                    onClick={() => deleteFeedback(item.id)}
                    className="p-2 rounded-lg hover:bg-red-500/10 text-red-500 transition-all"
                    title="Delete permanently"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
