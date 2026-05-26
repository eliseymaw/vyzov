import type { Metadata } from "next"

import "./globals.css"
import { Navbar } from "./components/Navbar"
import { ToastProvider } from "./components/Toast"

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
    <html lang="ru">
      <body className="min-h-full bg-black text-white antialiased">
        <ToastProvider>
          <Navbar />
          {children}
        </ToastProvider>
      </body>
    </html>
  )
}
