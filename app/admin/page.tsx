import { Suspense } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { FileText, PawPrint, Heart, FileX } from 'lucide-react'
import { AdminCharts } from '@/components/admin/AdminCharts'
import type { Doc } from '@/types'
import type { Pet } from '@/lib/pets'

interface Stats {
  totalDocs: number
  totalPets: number
  draftDocs: number
  draftPets: number
  totalLikes: number
}

function getWeekLabels(count: number): { start: Date; label: string }[] {
  const now = new Date()
  return Array.from({ length: count }, (_, i) => {
    const start = new Date(now)
    start.setDate(now.getDate() - (count - 1 - i) * 7)
    start.setHours(0, 0, 0, 0)
    const label = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    return { start, label }
  })
}

async function getChartData() {
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const supabase = await createClient()
  const since = new Date()
  since.setDate(since.getDate() - 56)

  const [docsRes, petsRes, topViewedRes, topLikedRes] = await Promise.all([
    supabase.from('docs').select('created_at').gte('created_at', since.toISOString()),
    service.from('pets').select('created_at').gte('created_at', since.toISOString()),
    service.from('pets').select('id, display_name, views_count').eq('published', true).order('views_count', { ascending: false }).limit(5),
    service.from('pets').select('id, display_name, likes_count').eq('published', true).order('likes_count', { ascending: false }).limit(5),
  ])

  const weeks = getWeekLabels(8)
  const docs = docsRes.data ?? []
  const pets = petsRes.data ?? []

  const weekly = weeks.map(({ start }, i) => {
    const end = i < weeks.length - 1 ? weeks[i + 1].start : new Date()
    // Label by end of range so data added on "May 2" appears under "May 2", not "Apr 26"
    const labelDate = i < weeks.length - 1 ? new Date(end.getTime() - 86400000) : new Date()
    const weekLabel = labelDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const docCount = docs.filter((d) => new Date(d.created_at) >= start && new Date(d.created_at) < end).length
    const petCount = pets.filter((p) => new Date(p.created_at) >= start && new Date(p.created_at) < end).length
    return { week: weekLabel, docs: docCount, pets: petCount }
  })

  return {
    weekly,
    topViewed: (topViewedRes.data ?? []).map((p) => ({ id: p.id, display_name: p.display_name, count: p.views_count ?? 0 })),
    topLiked: (topLikedRes.data ?? []).map((p) => ({ id: p.id, display_name: p.display_name, count: p.likes_count ?? 0 })),
  }
}

async function getStats(): Promise<Stats> {
  const supabase = await createClient()
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [docsRes, petsRes] = await Promise.all([
    supabase.from('docs').select('published'),
    service.from('pets').select('published, likes_count'),
  ])

  const docs = docsRes.data ?? []
  const pets = petsRes.data ?? []

  return {
    totalDocs: docs.length,
    totalPets: pets.length,
    draftDocs: docs.filter((d) => !d.published).length,
    draftPets: pets.filter((p) => !p.published).length,
    totalLikes: pets.reduce((sum, p) => sum + (p.likes_count ?? 0), 0),
  }
}

async function getRecent(): Promise<{ docs: Pick<Doc, 'id' | 'title' | 'category' | 'published' | 'created_at'>[]; pets: Pick<Pet, 'id' | 'display_name' | 'spritesheet_url' | 'published' | 'created_at'>[] }> {
  const supabase = await createClient()
  const service = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  const [docsRes, petsRes] = await Promise.all([
    supabase.from('docs').select('id, title, category, published, created_at').order('created_at', { ascending: false }).limit(5),
    service.from('pets').select('id, display_name, spritesheet_url, published, created_at').order('created_at', { ascending: false }).limit(5),
  ])

  return {
    docs: docsRes.data ?? [],
    pets: petsRes.data ?? [],
  }
}

function StatCard({ icon, label, value, href }: { icon: React.ReactNode; label: string; value: number; href?: string }) {
  const inner = (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors">
      <div className="text-muted-foreground">{icon}</div>
      <div>
        <p className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{inner}</Link> : <div>{inner}</div>
}

async function Dashboard() {
  const [stats, recent, chartData] = await Promise.all([getStats(), getRecent(), getChartData()])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-xl font-semibold mb-4">Overview</h1>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <StatCard icon={<FileText className="w-4 h-4" />} label="Total docs" value={stats.totalDocs} href="/admin/docs" />
          <StatCard icon={<PawPrint className="w-4 h-4" />} label="Total pets" value={stats.totalPets} href="/admin/pets" />
          <StatCard icon={<Heart className="w-4 h-4" />} label="Total likes" value={stats.totalLikes} />
          <StatCard icon={<FileX className="w-4 h-4" />} label="Drafts" value={stats.draftDocs + stats.draftPets} />
        </div>
      </div>

      <AdminCharts
        weekly={chartData.weekly}
        topViewed={chartData.topViewed}
        topLiked={chartData.topLiked}
      />

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent docs</h2>
            <Link href="/admin/docs" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            {recent.docs.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No docs yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.docs.map((doc) => (
                  <li key={doc.id}>
                    <Link href={`/admin/edit/${doc.id}`} className="flex items-center justify-between px-4 py-2.5 hover:bg-muted/50 transition-colors">
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{doc.title}</p>
                        <p className="text-xs text-muted-foreground">{doc.category}</p>
                      </div>
                      <span className={`shrink-0 ml-3 text-xs px-1.5 py-0.5 rounded-full ${doc.published ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {doc.published ? 'Published' : 'Draft'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold">Recent pets</h2>
            <Link href="/admin/pets" className="text-xs text-muted-foreground hover:text-foreground transition-colors">View all</Link>
          </div>
          <div className="border border-border rounded-xl overflow-hidden">
            {recent.pets.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">No pets yet.</p>
            ) : (
              <ul className="divide-y divide-border">
                {recent.pets.map((pet) => (
                  <li key={pet.id}>
                    <Link href={`/admin/pets/edit/${pet.id}`} className="flex items-center gap-3 px-4 py-2 hover:bg-muted/50 transition-colors">
                      <div
                        className="w-7 h-7 rounded shrink-0"
                        style={{
                          backgroundImage: `url(${pet.spritesheet_url})`,
                          backgroundRepeat: 'no-repeat',
                          backgroundPosition: '0 0',
                          backgroundSize: 'auto 100%',
                          imageRendering: 'pixelated',
                        }}
                      />
                      <p className="text-sm font-medium flex-1 truncate">{pet.display_name}</p>
                      <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded-full ${pet.published ? 'bg-foreground/10 text-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {pet.published ? 'Published' : 'Draft'}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminPage() {
  return (
    <Suspense fallback={
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded-lg" />
        <div className="grid grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => <div key={i} className="h-20 bg-muted animate-pulse rounded-xl" />)}
        </div>
        <div className="h-64 bg-muted animate-pulse rounded-xl" />
      </div>
    }>
      <Dashboard />
    </Suspense>
  )
}
