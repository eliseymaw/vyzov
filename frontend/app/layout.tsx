import type { Metadata } from "next"
import { Navbar } from "./components/Navbar"
import { ToastProvider } from "./components/Toast"
import "./globals.css"

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
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
