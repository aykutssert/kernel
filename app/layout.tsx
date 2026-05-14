import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from 'sonner'
import { RoamingPetWrapper } from '@/components/pets/RoamingPetWrapper'
import { AuthProvider } from '@/components/auth/AuthContext'
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
    default: 'Aykut Sert — Full-Stack Developer',
    template: '%s — Kernel',
  },
  description: 'Portfolio of Aykut Sert — full-stack developer building web apps, iOS apps, and AI integrations with Go, C#, Next.js, and Swift.',
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: 'website',
    siteName: 'Kernel',
    title: 'Aykut Sert — Full-Stack Developer',
    description: 'Portfolio of Aykut Sert — full-stack developer building web apps, iOS apps, and AI integrations with Go, C#, Next.js, and Swift.',
    url: siteUrl,
    images: [{ url: '/kernel-logo.png', width: 512, height: 512, alt: 'Kernel' }],
  },
  twitter: {
    card: 'summary',
    title: 'Aykut Sert — Full-Stack Developer',
    description: 'Portfolio of Aykut Sert — full-stack developer building web apps, iOS apps, and AI integrations with Go, C#, Next.js, and Swift.',
    images: ['/kernel-logo.png'],
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
          <AuthProvider>
          <div id="page-root">{children}</div>
          <RoamingPetWrapper />
          <DiscoverWidget />
          <Toaster position="bottom-center" mobileOffset={16} richColors />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
