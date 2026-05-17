"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    const userId = localStorage.getItem("userId")

    setIsAuthorized(!!userId)
  }, [])

  function handleLogout() {
    localStorage.removeItem("userId")

    setIsAuthorized(false)

    router.push("/login")
  }

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/">Лента</Link>

        {isAuthorized && (
          <>
            <Link href="/create-ad">
              Создать объявление
            </Link>

            <Link href="/profile">
              Профиль
            </Link>

            <Link href="/inbox">
              Входящие
            </Link>

            <button
              onClick={handleLogout}
              className="text-red-400"
            >
              Выйти
            </button>
          </>
        )}

        {!isAuthorized && (
          <>
            <Link href="/login">
              Войти
            </Link>

            <Link href="/register">
              Регистрация
            </Link>
          </>
        )}
      </div>
    </nav>
  )
}