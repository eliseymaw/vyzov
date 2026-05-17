"use client"

import { useEffect, useState } from "react"

type User = {
  id: number
  name: string
  city: string
  districts: string[] | null
  metros: string[] | null
  gender: string
  age: number
  has_access: boolean
  receive_scope: string
}

type Ad = {
  id: number
  text: string
  city: string
  scope: string
  districts: string[]
  metros: string[]
  target_gender: string
  target_age_from: number
  target_age_to: number
  contact: string
}

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"

  return "Не указано"
}

function formatGeo(scope: string, districts: string[], metros: string[]) {
  if (scope === "city") return "Весь город"

  if (scope === "district") {
    return districts.length > 0
      ? `Районы: ${districts.join(", ")}`
      : "Районы не указаны"
  }

  if (scope === "metro") {
    return metros.length > 0
      ? `Метро: ${metros.join(", ")}`
      : "Метро не указано"
  }

  return "Гео не указано"
}

function formatReceiveScope(user: User) {
  if (user.receive_scope === "city") return "Получаете рассылки по всему городу"

  if (user.receive_scope === "district") {
    return `Получаете рассылки по районам: ${(user.districts ?? []).join(", ")}`
  }

  if (user.receive_scope === "metro") {
    return `Получаете рассылки по метро: ${(user.metros ?? []).join(", ")}`
  }

  return "Настройки получения не указаны"
}

export default function InboxPage() {
  const [user, setUser] = useState<User | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  async function loadInbox() {
    const userId = localStorage.getItem("userId")

    if (!userId) {
      window.location.href = "/register"
      return
    }

    const userResponse = await fetch(`http://localhost:8000/users/${userId}`)
    const userData = await userResponse.json()
    if (!userData) {
      localStorage.removeItem("userId")
      window.location.href = "/register"
      return
    }

    setUser(userData)

    if (userData.has_access) {
      const inboxResponse = await fetch(
        `http://localhost:8000/users/${userId}/inbox`
      )

      const inboxData = await inboxResponse.json()
      setAds(inboxData)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInbox()
  }, [])

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Загрузка входящих...
      </main>
    )
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        Сначала зарегистрируйтесь.
      </main>
    )
  }

  if (!user.has_access) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-zinc-900 text-2xl">
            🔒
          </div>

          <h1 className="mt-6 text-3xl font-bold">Входящие закрыты</h1>

          <p className="mt-4 text-zinc-400">
            Лента доступна всем, но контакты отправителей открываются только во
            входящих после активации доступа.
          </p>

          <button
            onClick={async () => {
              const userId = localStorage.getItem("userId")

              if (!userId) {
                return
              }

              await fetch(
                `http://localhost:8000/users/${userId}/unlock-inbox`,
                {
                  method: "POST",
                }
              )

              window.location.reload()
            }}
            className="mt-8 rounded-xl bg-white px-6 py-3 font-medium text-black"
          >
            Получить доступ
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold">Входящие рассылки</h1>

        <p className="mt-2 text-zinc-400">{formatReceiveScope(user)}</p>

        <div className="mt-8 space-y-4">
          {ads.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
              <p className="text-zinc-400">Пока нет подходящих рассылок</p>
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
              >
                <p className="text-lg font-medium">{ad.text}</p>

                <div className="mt-4 space-y-2 text-sm text-zinc-400">
                  <p>Город: {ad.city}</p>
                  <p>
                    Гео: {formatGeo(ad.scope, ad.districts || [], ad.metros || [])}
                  </p>
                  <p>
                    Кому: {formatGender(ad.target_gender)} • Возраст:{" "}
                    {ad.target_age_from}–{ad.target_age_to}
                  </p>
                </div>

                <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">
                  <p className="text-sm text-zinc-500">Контакт отправителя</p>
                  <p className="mt-2 text-green-400">{ad.contact}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}