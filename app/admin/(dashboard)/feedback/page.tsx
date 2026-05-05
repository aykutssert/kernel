import { createClient } from '@/lib/supabase/server'
import { FeedbackManager } from '@/components/admin/FeedbackManager'
import { redirect } from 'next/navigation'

export default async function AdminFeedbackPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Admin kontrolü
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/')
  }

  const { data: feedback } = await supabase
    .from('site_feedback')
    .select('*')
    .order('status', { ascending: false }) // pending olanlar önce gelsin
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <FeedbackManager initialData={feedback || []} />
    </div>
  )
}
