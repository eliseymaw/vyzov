"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import { authFetch, clearAuth, isAuthenticated } from "../lib/auth"

type User = {
  balance: number
}

export function Navbar() {
  const router = useRouter()
  const pathname = usePathname()

  const [authorized, setAuthorized] = useState(false)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    async function loadUser() {
      const authed = isAuthenticated()
      setAuthorized(authed)

      if (!authed) return

      try {
        const response = await authFetch("http://localhost:8000/users/me")
        const user: User = await response.json()
        setBalance(user.balance ?? 0)
      } catch (error) {
        console.error("Ошибка загрузки пользователя:", error)
      }
    }

    loadUser()
  }, [pathname])

  function handleLogout() {
    clearAuth()
    setAuthorized(false)
    setBalance(0)
    router.push("/login")
  }

  if (pathname === "/login" || pathname === "/register") {
    return null
  }

  return (
    <nav className="border-b border-zinc-800 px-6 py-4">
      <div className="flex items-center gap-6">
        <Link href="/">Лента</Link>

        {authorized && (
          <>
            <Link href="/create-ad">Создать объявление</Link>
            <Link href="/profile">Профиль</Link>
            <Link href="/inbox">Входящие</Link>

            <div className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-1 text-sm text-green-400">
              Баланс: {balance} ₽
            </div>

            <button onClick={handleLogout} className="text-red-400">
              Выйти
            </button>
          </>
        )}

        {!authorized && (
          <>
            <Link href="/login">Войти</Link>
            <Link href="/register">Регистрация</Link>
          </>
        )}
      </div>
    </nav>
  )
}
