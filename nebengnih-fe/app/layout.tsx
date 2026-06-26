import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import type { ReactNode } from 'react'
import { RoomProvider } from '@/components/providers/room-provider'
import { PwaRegister } from '@/components/pwa-register'
import 'leaflet/dist/leaflet.css'
import './globals.css'

export const viewport: Viewport = {
  themeColor: '#10B981',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: 'NebengNih',
  description: 'Anonymous carpool coordination & cost splitting for daily rides.',
  manifest: '/manifest.webmanifest',
  generator: 'v0.app',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NebengNih',
  },
  icons: {
    icon: [
      {
        url: '/icon-192x192.png',
        type: 'image/png',
      },
      {
        url: '/icon-512x512.png',
        type: 'image/png',
      },
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
        type: 'image/png',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
        type: 'image/png',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode
}>) {
  return (
    <html lang="en">
      <body className="font-sans antialiased bg-background overscroll-none">
        <RoomProvider>{children}</RoomProvider>
        <PwaRegister />
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
