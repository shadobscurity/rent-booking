import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Rent Booking Starter',
  description: 'Dress rental booking MVP',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header className="border-b">
          <div className="max-w-5xl mx-auto p-4 flex justify-between">
            <a href="/" className="font-semibold">Rent Booking</a>
            <nav className="text-sm opacity-80">MVP</nav>
          </div>
        </header>
        <main className="max-w-5xl mx-auto p-4">
          {children}
        </main>
      </body>
    </html>
  )
}
