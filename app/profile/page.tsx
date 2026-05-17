"use client"

import { useEffect, useState } from "react"

const cities = ["Москва", "Санкт-Петербург"]

const districtsByCity: Record<string, string[]> = {
  Москва: ["Центр", "Пресненский", "Арбат", "Тверской"],
  "Санкт-Петербург": ["Центральный", "Петроградский", "Адмиралтейский"],
}

const metrosByCity: Record<string, string[]> = {
  Москва: ["Белорусская", "Маяковская", "Арбатская", "ВДНХ", "Кантемировская"],
  "Санкт-Петербург": ["Невский проспект", "Горьковская", "Адмиралтейская"],
}

const ageOptions = Array.from({ length: 63 }, (_, index) =>
  String(index + 18)
)

type User = {
  id: number
  name: string
  city: string
  districts: string[]
  metros: string[]
  gender: string
  age: number
  has_access: boolean
  receive_scope: string
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [metro, setMetro] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [receiveScope, setReceiveScope] = useState("city")

  useEffect(() => {
    async function loadUser() {
      const storedUserId = localStorage.getItem("userId")

      if (!storedUserId) {
        window.location.href = "/register"
        return
      }
      setUserId(storedUserId)

      const response = await fetch(
        `http://localhost:8000/users/${storedUserId}`
      )

      const data = await response.json()
      if (!data) {
        localStorage.removeItem("userId")
        window.location.href = "/register"
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

    if (!userId) {
      alert("Пользователь не найден. Зарегистрируйтесь заново.")
      return
    }

    if (!name.trim()) {
      alert("Введите имя")
      return
    }

    if (!city) {
      alert("Выберите город")
      return
    }

    if (receiveScope === "district" && !district) {
      alert("Выберите район")
      return
    }

    if (receiveScope === "metro" && !metro) {
      alert("Выберите метро")
      return
    }

    if (!gender) {
      alert("Выберите пол")
      return
    }

    if (!age) {
      alert("Выберите возраст")
      return
    }

    const response = await fetch(`http://localhost:8000/users/${userId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
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
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">
            Какие рассылки получать
          </label>

          <div className="mt-2 grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => setReceiveScope("city")}
              className={`rounded-xl border px-3 py-2 text-sm ${receiveScope === "city"
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-black text-white"
                }`}
            >
              Весь город
            </button>

            <button
              type="button"
              onClick={() => setReceiveScope("district")}
              className={`rounded-xl border px-3 py-2 text-sm ${receiveScope === "district"
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-black text-white"
                }`}
            >
              Мой район
            </button>

            <button
              type="button"
              onClick={() => setReceiveScope("metro")}
              className={`rounded-xl border px-3 py-2 text-sm ${receiveScope === "metro"
                ? "border-white bg-white text-black"
                : "border-zinc-800 bg-black text-white"
                }`}
            >
              Моё метро
            </button>
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
                <option key={item} value={item}>
                  {item}
                </option>
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
                <option key={item} value={item}>
                  {item}
                </option>
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
              <option key={item} value={item}>
                {item}
              </option>
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