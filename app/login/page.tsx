"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export default function LoginPage() {
  const router = useRouter()

  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!login.trim()) {
      alert("Введите логин")
      return
    }

    if (!password.trim()) {
      alert("Введите пароль")
      return
    }

    const response = await fetch("http://localhost:8000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        login,
        password,
      }),
    })

    const result = await response.json()

    if (result.error) {
      alert(result.error)
      return
    }

    localStorage.setItem("userId", String(result.user_id))

    window.location.href = "/"
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Вход</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div>
          <label className="block text-sm text-zinc-400">Логин</label>
          <input
            value={login}
            onChange={(event) => setLogin(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Введите логин"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Пароль</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Введите пароль"
          />
        </div>

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Войти
        </button>

        <button
          type="button"
          onClick={() => router.push("/register")}
          className="block text-sm text-zinc-400 underline"
        >
          Нет аккаунта? Зарегистрироваться
        </button>
      </form>
    </main>
  )
}