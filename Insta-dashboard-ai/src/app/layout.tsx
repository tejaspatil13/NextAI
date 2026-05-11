import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'NextAI — Instagram Intelligence Platform',
  description: 'Competitor analysis, AI content ideas, hooks & scripts for Instagram creators',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  )
}
