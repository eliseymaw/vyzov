"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"

type Ad = {
  id: number
  text: string
  city: string
  scope: string
  districts: string[] | null
  metros: string[] | null
  target_gender: string
  target_age_from: number
  target_age_to: number
  contact: string
}

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"
  return gender
}

function formatScope(scope: string, districts: string[] | null, metros: string[] | null) {
  if (scope === "city") return "Весь город"
  if (scope === "district") return `Районы: ${(districts ?? []).join(", ") || "—"}`
  if (scope === "metro") return `Метро: ${(metros ?? []).join(", ") || "—"}`
  return scope
}

function formatPrice(scope: string, districts: string[] | null, metros: string[] | null) {
  if (scope === "city") return 300
  if (scope === "district") return Math.max((districts ?? []).length, 1) * 150
  if (scope === "metro") return Math.max((metros ?? []).length, 1) * 50
  return 300
}

export default function MyAdsPage() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadAds() {
      try {
        const response = await authFetch("/api/users/me/ads")
        const data = await response.json()
        setAds(data)
      } catch (error) {
        console.error("Ошибка загрузки рассылок:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAds()
  }, [])

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Мои рассылки</h1>

      <p className="mt-2 text-zinc-400">
        История всех созданных тобой рассылок
      </p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-zinc-500">Загрузка...</p>
        ) : ads.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Ты ещё не создавал рассылок</p>
            <a
              href="/create-ad"
              className="mt-4 inline-block rounded-xl bg-white px-4 py-2 text-sm font-medium text-black"
            >
              Создать первую
            </a>
          </div>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <p className="text-base text-white">{ad.text}</p>

              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-zinc-400">
                <div>
                  <span className="text-zinc-600">Город</span>
                  <p className="mt-0.5 text-zinc-300">{ad.city}</p>
                </div>
                <div>
                  <span className="text-zinc-600">Охват</span>
                  <p className="mt-0.5 text-zinc-300">
                    {formatScope(ad.scope, ad.districts, ad.metros)}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-600">Аудитория</span>
                  <p className="mt-0.5 text-zinc-300">
                    {formatGender(ad.target_gender)}, {ad.target_age_from}–{ad.target_age_to} лет
                  </p>
                </div>
                <div>
                  <span className="text-zinc-600">Стоимость</span>
                  <p className="mt-0.5 text-zinc-300">
                    {formatPrice(ad.scope, ad.districts, ad.metros)} ₽
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-zinc-800 bg-black px-4 py-3">
                <span className="text-xs text-zinc-600">Контакт</span>
                <p className="mt-0.5 text-sm text-green-400">{ad.contact}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
