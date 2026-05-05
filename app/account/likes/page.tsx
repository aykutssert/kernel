import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { AccountLikesClient } from '@/components/account/AccountLikesClient'
import { getDocs } from '@/lib/docs'
import { getLikedDocs, getLikedPets } from '@/lib/account'
import { createClient } from '@/lib/supabase/server'

type LikesType = 'pets' | 'prompts'

interface Props {
  searchParams: Promise<{ type?: string }>
}

function LikesSkeleton() {
  return (
    <div>
      <div className="mb-4 flex items-end justify-between">
        <div>
          <div className="mb-2 h-7 w-24 animate-pulse rounded bg-muted" />
          <div className="h-5 w-56 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-4 w-12 animate-pulse rounded bg-muted" />
      </div>
      <div className="mb-8 border-b border-border pb-2">
        <div className="h-8 w-36 animate-pulse rounded bg-muted" />
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-72 animate-pulse rounded-lg border border-border bg-muted/50" />
        ))}
      </div>
    </div>
  )
}

async function AccountLikesContent({ searchParams }: Props) {
  const params = await searchParams
  const type: LikesType = params.type === 'prompts' ? 'prompts' : 'pets'
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/prompts')
  }

  const [pets, prompts] = await Promise.all([
    getLikedPets(user.id),
    getLikedDocs(user.id),
  ])
  return <AccountLikesClient initialPets={pets} initialPrompts={prompts} type={type} />
}

export default async function AccountLikesPage({ searchParams }: Props) {
  const docs = await getDocs()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 pb-12 pt-6 md:px-0">
        <Suspense fallback={<LikesSkeleton />}>
          <AccountLikesContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
