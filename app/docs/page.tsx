import { Navbar } from '@/components/layout/Navbar'
import { Sidebar } from '@/components/layout/Sidebar'
import { Footer } from '@/components/layout/Footer'
import { getDocs } from '@/lib/docs'

export default async function DocsIndexPage() {
  let docs: Awaited<ReturnType<typeof getDocs>> = []
  try {
    docs = await getDocs()
  } catch {}

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex flex-1 max-w-[1400px] mx-auto w-full">
        <aside className="hidden md:block w-[260px] shrink-0 border-r sticky top-[57px] h-[calc(100vh-57px)] overflow-y-auto">
          <Sidebar docs={docs} />
        </aside>
        <main className="flex-1 flex items-center justify-center text-sm text-muted-foreground">
          Select a page from the sidebar.
        </main>
      </div>
      <Footer />
    </div>
  )
}
