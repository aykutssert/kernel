import { Images } from 'lucide-react'
import { Navbar } from '@/components/layout/Navbar'
import { CategoryTabs } from '@/components/layout/CategoryTabs'
import { Footer } from '@/components/layout/Footer'
import { ProductSubnav } from '@/components/product-templates/ProductSubnav'
import { getDocs } from '@/lib/docs'

export default async function ProductResultsPage() {
  const docs = await getDocs()

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar docs={docs} />
      <CategoryTabs docs={docs} />
      <main className="mx-auto w-full max-w-[1400px] flex-1 px-4 py-6 md:px-0">
        <ProductSubnav />
        <div className="flex min-h-[360px] flex-col items-center justify-center text-center">
          <Images className="mb-4 h-10 w-10 text-muted-foreground/30" />
          <p className="text-sm font-medium">Results is coming next.</p>
          <p className="mt-1 max-w-sm text-xs text-muted-foreground">
            Generated product photos will be collected here.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  )
}
