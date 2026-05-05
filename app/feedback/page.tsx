import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'
import { createClient } from '@/lib/supabase/server'
import { MessageSquare, Quote } from 'lucide-react'

export const revalidate = 3600 // Saatte bir yenile

export default async function FeedbackPage() {
  const docs = await getDocs()
  const supabase = await createClient()

  const { data: feedback } = await supabase
    .from('site_feedback')
    .select('*')
    .eq('status', 'published')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false })

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <main className="mx-auto w-full max-w-4xl flex-1 px-6 py-12">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight">Wall of Feedback</h1>
          <p className="text-lg text-muted-foreground">
            Voices from the community. Your suggestions shape the future of Kernel.
          </p>
        </div>

        <div className="grid gap-6">
          {!feedback || feedback.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed rounded-3xl">
              <MessageSquare className="h-10 w-10 text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground">No public feedback yet. Be the first to suggest something!</p>
            </div>
          ) : (
            feedback.map((item) => (
              <div 
                key={item.id} 
                className="relative overflow-hidden rounded-2xl border bg-card p-6 shadow-sm transition-all hover:shadow-md"
              >
                <Quote className="absolute -right-2 -top-2 h-24 w-24 text-muted-foreground/5 opacity-10" />
                <div className="relative z-10 space-y-4">
                  <p className="text-lg leading-relaxed text-foreground/90 italic">
                    "{item.content}"
                  </p>
                  <div className="flex items-center justify-between border-t pt-4">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-gradient-to-br from-muted to-muted-foreground/20 flex items-center justify-center text-[10px] font-bold">
                        {item.author_name[0].toUpperCase()}
                      </div>
                      <span className="text-sm font-semibold">{item.author_name}</span>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-1 rounded">
                      via {item.source}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}
