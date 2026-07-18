import type { Metadata, Viewport } from 'next'

import './globals.css'

export const metadata: Metadata = {
  title: 'Integrate Techno Trade',
  description:
    'Integrate Techno Trade — industrial chemicals, pharmaceutical equipment, and trusted partnerships.',
  icons: {
    icon: '/assets/logo.png',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

/**
 * Root layout with Bubble-matching font stack and site metadata.
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
