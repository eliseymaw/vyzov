"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"

const cities = ["Москва", "Санкт-Петербург"]

const districtsByCity: Record<string, string[]> = {
  Москва: ["Центр", "Пресненский", "Арбат", "Тверской"],
  "Санкт-Петербург": ["Центральный", "Петроградский", "Адмиралтейский"],
}

const metrosByCity: Record<string, string[]> = {
  Москва: ["Белорусская", "Маяковская", "Арбатская", "ВДНХ", "Кантемировская"],
  "Санкт-Петербург": ["Невский проспект", "Горьковская", "Адмиралтейская"],
}

const ageOptions = Array.from({ length: 63 }, (_, index) => String(index + 18))

type User = {
  id: number
  name: string
  city: string
  districts: string[]
  metros: string[]
  gender: string
  age: number
  balance: number
  inbox_unlocked: boolean
  receive_scope: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [metro, setMetro] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [receiveScope, setReceiveScope] = useState("city")

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadUser() {
      const response = await authFetch("http://localhost:8000/users/me")
      const data = await response.json()

      if (!data || data.detail) {
        window.location.href = "/login"
        return
      }

      setUser(data)
      setName(data.name ?? "")
      setCity(data.city ?? "")
      setDistrict(data.districts?.[0] ?? "")
      setMetro(data.metros?.[0] ?? "")
      setGender(data.gender ?? "")
      setAge(data.age ? String(data.age) : "")
      setReceiveScope(data.receive_scope ?? "city")
    }

    loadUser()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!name.trim()) { alert("Введите имя"); return }
    if (!city) { alert("Выберите город"); return }
    if (receiveScope === "district" && !district) { alert("Выберите район"); return }
    if (receiveScope === "metro" && !metro) { alert("Выберите метро"); return }
    if (!gender) { alert("Выберите пол"); return }
    if (!age) { alert("Выберите возраст"); return }

    const response = await authFetch("http://localhost:8000/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name,
        city,
        districts: district ? [district] : [],
        metros: metro ? [metro] : [],
        gender,
        age: Number(age),
        receive_scope: receiveScope,
      }),
    })

    const updatedUser = await response.json()
    setUser(updatedUser)
    alert("Профиль обновлён")
  }

  const availableDistricts = city ? districtsByCity[city] ?? [] : []
  const availableMetros = city ? metrosByCity[city] ?? [] : []

  if (!user) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Загрузка профиля...
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Профиль</h1>

      <p className="mt-2 text-zinc-400">
        Эти настройки влияют на то, какие рассылки будут попадать во входящие.
      </p>

      <div className="mt-6 max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
        <p className="text-sm text-zinc-500">Баланс</p>
        <p className="mt-2 text-3xl font-bold">{user.balance} ₽</p>
        <p className="mt-2 text-sm text-zinc-400">
          Inbox открывается при балансе от 500 ₽
        </p>

        <button
          type="button"
          onClick={async () => {
            const response = await authFetch(
              "http://localhost:8000/users/me/top-up",
              {
                method: "POST",
                body: JSON.stringify({ amount: 500 }),
              }
            )
            const result = await response.json()
            if (result.user) {
              setUser(result.user)
            }
          }}
          className="mt-5 rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Пополнить на 500 ₽
        </button>
      </div>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div>
          <label className="block text-sm text-zinc-400">Имя</label>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Город</label>
          <select
            value={city}
            onChange={(event) => {
              setCity(event.target.value)
              setDistrict("")
              setMetro("")
            }}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать город</option>
            {cities.map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Какие рассылки получать</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["city", "district", "metro"].map((scope) => (
              <button
                key={scope}
                type="button"
                onClick={() => setReceiveScope(scope)}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  receiveScope === scope
                    ? "border-white bg-white text-black"
                    : "border-zinc-800 bg-black text-white"
                }`}
              >
                {scope === "city" ? "Весь город" : scope === "district" ? "Мой район" : "Моё метро"}
              </button>
            ))}
          </div>
        </div>

        {receiveScope === "district" && (
          <div>
            <label className="block text-sm text-zinc-400">Район</label>
            <select
              value={district}
              onChange={(event) => setDistrict(event.target.value)}
              disabled={!city}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white disabled:opacity-50"
            >
              <option value="">Выбрать район</option>
              {availableDistricts.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

        {receiveScope === "metro" && (
          <div>
            <label className="block text-sm text-zinc-400">Метро</label>
            <select
              value={metro}
              onChange={(event) => setMetro(event.target.value)}
              disabled={!city}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white disabled:opacity-50"
            >
              <option value="">Выбрать метро</option>
              {availableMetros.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
        )}

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
          Сохранить профиль
        </button>
      </form>
    </main>
  )
}
