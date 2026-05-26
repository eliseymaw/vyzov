import type { Metadata } from "next"
import Link from "next/link"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "ВЫЗОВ",
  description: "MVP проекта",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-black text-white">
        <nav className="border-b border-zinc-800 px-6 py-4">
          <div className="flex gap-6">
            <Link href="/">Лента</Link>

            <Link href="/create-ad">
              Создать объявление
            </Link>

            <Link href="/profile">
              Профиль
            </Link>

            <Link href="/inbox">
              Входящие
            </Link>
            
          </div>
        </nav>

        {children}
      </body>
    </html>
  )
}