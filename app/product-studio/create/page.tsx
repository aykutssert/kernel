import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { ProductSubnav } from '@/components/product-templates/ProductSubnav'
import { ProductCreateForm } from '@/components/product-templates/ProductCreateForm'
import { getDocs } from '@/lib/docs'
import { getProductTemplate, getProductTemplates } from '@/lib/product-templates'
import { createClient } from '@/lib/supabase/server'

interface Props {
  searchParams: Promise<{ template?: string }>
}

async function ProductCreateContent({ searchParams }: Props) {
  const params = await searchParams
  const [templates, selectedTemplate, supabase] = await Promise.all([
    getProductTemplates(),
    params.template ? getProductTemplate(params.template) : Promise.resolve(null),
    createClient(),
  ])
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/product-studio/templates')
  if (templates.length === 0) redirect('/product-studio/templates')

  const initialTemplate = selectedTemplate ?? templates[0]

  return <ProductCreateForm templates={templates} initialTemplate={initialTemplate} />
}

function ProductCreateSkeleton() {
  return (
    <div className="flex min-h-[360px] items-center justify-center rounded-md border border-dashed border-border">
      <p className="text-sm text-muted-foreground">Loading create form...</p>
    </div>
  )
}

export default async function ProductCreatePage({ searchParams }: Props) {
  const docs = await getDocs()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-0">
        <ProductSubnav />
        <Suspense fallback={<ProductCreateSkeleton />}>
          <ProductCreateContent searchParams={searchParams} />
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}
