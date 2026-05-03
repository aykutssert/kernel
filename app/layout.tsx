import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import './globals.css'

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
})

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
})

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

export const metadata: Metadata = {
  title: {
    default: 'Kernel',
    template: '%s — Kernel',
  },
  description: 'Curated, LLM-friendly documentation for AI concepts, agent frameworks, MCP, and more.',
  metadataBase: new URL(baseUrl),
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
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}
