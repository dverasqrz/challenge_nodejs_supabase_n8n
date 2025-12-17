import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'To-Do List App',
  description: 'A Next.js To-Do List app with Supabase persistence',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}

