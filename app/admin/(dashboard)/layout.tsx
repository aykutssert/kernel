import { AdminShell } from '@/components/admin/AdminShell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/admin/login')
  }

  // Admin kontrolü - Kesin çözüm
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    console.error('Unauthorized admin access attempt:', user.email)
    redirect('/')
  }

  return <AdminShell>{children}</AdminShell>
}
