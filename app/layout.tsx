import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { RoamingPetWrapper } from '@/components/pets/RoamingPetWrapper'
import { DiscoverWidget } from '@/components/layout/DiscoverWidget'
import { siteUrl } from '@/lib/site'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

export const metadata: Metadata = {
  title: {
    default: 'Kernel',
    template: '%s — Kernel',
  },
  description: 'Curated, LLM-friendly documentation for AI concepts, agent frameworks, MCP, and more.',
  metadataBase: new URL(siteUrl),
  openGraph: {
    type: 'website',
    siteName: 'Kernel',
    title: 'Kernel',
    description: 'Curated, LLM-friendly documentation for AI concepts, agent frameworks, MCP, and more.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kernel',
    description: 'Curated, LLM-friendly documentation for AI concepts, agent frameworks, MCP, and more.',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <body className="min-h-screen bg-background font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <div id="page-root">{children}</div>
          <RoamingPetWrapper />
          <DiscoverWidget />
          <Toaster position="bottom-center" mobileOffset={16} richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
