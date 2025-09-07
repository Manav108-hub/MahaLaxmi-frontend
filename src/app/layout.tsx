import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { Providers } from '@/components/providers/Providers'

// Optimize font loading with display swap
const inter = Inter({ 
  subsets: ['latin'],
  display: 'swap',
  preload: true,
})

// Enhanced metadata with caching hints
export const metadata: Metadata = {
  title: 'MahaLaxmi Hardware - Quality Hardware Solutions',
  description: 'Your trusted hardware store for all construction and home improvement needs',
  keywords: 'hardware, construction, tools, home improvement, quality hardware',
  authors: [{ name: 'MahaLaxmi Hardware' }],
  robots: 'index, follow',
  viewport: 'width=device-width, initial-scale=1',
  
  // Open Graph for better sharing
  openGraph: {
    title: 'MahaLaxmi Hardware - Quality Hardware Solutions',
    description: 'Your trusted hardware store for all construction and home improvement needs',
    type: 'website',
    locale: 'en_US',
  },
  
  // Additional metadata for performance
  other: {
    'Cache-Control': 'public, max-age=3600, stale-while-revalidate=7200',
  },
}

// Enable static optimization
export const dynamic = 'force-static';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Preload critical resources */}
        <link rel="preconnect" href="https://mahalaxmi-test.s3.ap-south-1.amazonaws.com" />
        <link rel="dns-prefetch" href="https://mahalaxmi-test.s3.ap-south-1.amazonaws.com" />
        
        {/* Optimize resource loading */}
        <link rel="preload" href="/globals.css" as="style" />
        
        {/* Cache control meta tags */}
        <meta httpEquiv="Cache-Control" content="public, max-age=3600" />
      </head>
      <body suppressHydrationWarning>
        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  )
}