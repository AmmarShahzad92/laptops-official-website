import type { Metadata, Viewport } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Navbar } from '@/components/layout/navbar'
import { Footer } from '@/components/layout/footer'
import './globals.css'

const geist = Geist({ 
  subsets: ["latin"],
  variable: "--font-geist-sans",
});

const geistMono = Geist_Mono({ 
  subsets: ["latin"],
  variable: "--font-geist-mono",
});

export const metadata: Metadata = {
  title: {
    default: 'Laptops Official - Pakistan\'s #1 Laptop Store',
    template: '%s | Laptops Official',
  },
  description: 'Know It. Test It. Own It. Pakistan\'s trusted destination for laptops and desktops. Quality products, genuine warranties, and exceptional customer service.',
  keywords: ['laptops', 'desktops', 'computers', 'Pakistan', 'Dell', 'HP', 'Lenovo', 'gaming laptops', 'office laptops'],
  authors: [{ name: 'Laptops Official' }],
  creator: 'Laptops Official',
  openGraph: {
    type: 'website',
    locale: 'en_PK',
    siteName: 'Laptops Official',
    title: 'Laptops Official - Pakistan\'s #1 Laptop Store',
    description: 'Know It. Test It. Own It. Pakistan\'s trusted destination for laptops and desktops.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Laptops Official - Pakistan\'s #1 Laptop Store',
    description: 'Know It. Test It. Own It. Pakistan\'s trusted destination for laptops and desktops.',
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A1628',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="font-sans antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
        </div>
        <Analytics />
      </body>
    </html>
  )
}
