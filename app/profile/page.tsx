"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  name: string
  city: string
  district: string | null
  gender: string
  age: number
  has_access: boolean
}

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)

  const [name, setName] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    async function loadUser() {
      const response = await fetch("http://localhost:8000/users/1")
      const data = await response.json()

      setUser(data)
      setName(data.name)
      setCity(data.city)
      setDistrict(data.district || "")
      setGender(data.gender)
      setAge(String(data.age))
      setHasAccess(data.has_access)
    }

    loadUser()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const response = await fetch("http://localhost:8000/users/1", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name,
        city,
        district,
        gender,
        age: Number(age),
        has_access: hasAccess,
      }),
    })

    const updatedUser = await response.json()

    setUser(updatedUser)

    alert("Профиль обновлён")
  }

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

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
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
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Район</label>
          <input
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          />
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
          <input
            value={age}
            onChange={(event) => setAge(event.target.value)}
            type="number"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-zinc-300">
          <input
            type="checkbox"
            checked={hasAccess}
            onChange={(event) => setHasAccess(event.target.checked)}
          />
          Доступ к входящим активен
        </label>

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