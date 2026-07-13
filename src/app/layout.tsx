import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'AWC Corporate portal',
  description: 'Enterprise Search & Communications Suite',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  )
}
