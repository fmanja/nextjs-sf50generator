import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AI SF-50 Assistant",
  description: "AI-powered NOA code recommendations for SF-50 form generation",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const currentYear = new Date().getFullYear()
  
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <footer className="border-t bg-slate-50 py-4 text-center text-sm text-slate-600">
          <p>© {currentYear} Frank Manja. All rights reserved.</p>
        </footer>
      </body>
    </html>
  )
}

