"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { setAuth } from "../lib/auth"
import { useToast } from "../components/Toast"

const cities = ["Москва", "Санкт-Петербург"]
const ageOptions = Array.from({ length: 63 }, (_, index) => String(index + 18))

export default function RegisterPage() {
  const router = useRouter()
  const toast = useToast()

  const [login, setLogin] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!login.trim()) { toast("Введите логин", "error"); return }
    if (!password.trim()) { toast("Введите пароль", "error"); return }
    if (!name.trim()) { toast("Введите имя", "error"); return }
    if (!city) { toast("Выберите город", "error"); return }
    if (!gender) { toast("Выберите пол", "error"); return }
    if (!age) { toast("Выберите возраст", "error"); return }

    const response = await fetch("http://localhost:8000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        login,
        password,
        name,
        city,
        districts: [],
        metros: [],
        gender,
        age: Number(age),
        inbox_unlocked: false,
        receive_scope: "city",
      }),
    })

    const result = await response.json()

    if (result.error) {
      toast(result.error, "error")
      return
    }

    setAuth(result.access_token, result.user_id)

    window.location.href = "/profile"
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Регистрация</h1>

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
            placeholder="Например: alex123"
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

        <div>
          <label className="block text-sm text-zinc-400">Имя</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Например: Алексей"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Город</label>
          <select
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать город</option>
            {cities.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Пол</label>
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать</option>
            <option value="male">Мужчина</option>
            <option value="female">Девушка</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Возраст</label>
          <select
            value={age}
            onChange={(event) => setAge(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать возраст</option>
            {ageOptions.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Зарегистрироваться
        </button>

        <button
          type="button"
          onClick={() => router.push("/login")}
          className="block text-sm text-zinc-400 underline"
        >
          Уже есть аккаунт? Войти
        </button>
      </form>
    </main>
  )
}
