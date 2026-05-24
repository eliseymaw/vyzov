"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"
import { useToast } from "../components/Toast"

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

function formatGeo(scope: string, districts: string[] | null, metros: string[] | null) {
  if (scope === "city") return "Весь город"
  if (scope === "district") return (districts ?? []).join(", ") || "—"
  if (scope === "metro") return (metros ?? []).join(", ") || "—"
  return "—"
}

function getScopeBadgeStyle(scope: string) {
  if (scope === "city") return "bg-blue-950 text-blue-400 border-blue-800"
  if (scope === "district") return "bg-purple-950 text-purple-400 border-purple-800"
  if (scope === "metro") return "bg-orange-950 text-orange-400 border-orange-800"
  return "bg-zinc-900 text-zinc-400 border-zinc-700"
}

export default function FavoritesPage() {
  const toast = useToast()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<number | null>(null)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadFavorites() {
      try {
        const response = await authFetch("http://localhost:8000/users/me/favorites")
        const data = await response.json()
        setAds(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  async function removeFavorite(ad: Ad) {
    await authFetch(`http://localhost:8000/ads/${ad.id}/favorite`, { method: "DELETE" })
    setAds((prev) => prev.filter((a) => a.id !== ad.id))
    toast("Убрано из избранного", "info")
  }

  async function copyContact(ad: Ad) {
    try {
      await navigator.clipboard.writeText(ad.contact)
      setCopiedId(ad.id)
      toast("Контакт скопирован", "success")
      setTimeout(() => setCopiedId(null), 2000)
    } catch {
      toast("Не удалось скопировать", "error")
    }
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Избранное</h1>
            <p className="mt-1 text-sm text-zinc-500">Сохранённые рассылки</p>
          </div>
          <a
            href="/inbox"
            className="text-sm text-zinc-500 hover:text-white"
          >
            ← Входящие
          </a>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-zinc-500">Загрузка...</p>
          ) : ads.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="text-2xl">★</p>
              <p className="mt-3 text-zinc-400">Избранных рассылок пока нет</p>
              <a
                href="/inbox"
                className="mt-4 inline-block text-sm text-zinc-500 underline hover:text-white"
              >
                Перейти во входящие
              </a>
            </div>
          ) : (
            ads.map((ad) => (
              <div
                key={ad.id}
                className="rounded-2xl border border-yellow-900 bg-zinc-950 p-5"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${getScopeBadgeStyle(ad.scope)}`}>
                    {formatGeo(ad.scope, ad.districts, ad.metros)}
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-zinc-600">
                      {formatGender(ad.target_gender)}, {ad.target_age_from}–{ad.target_age_to} лет
                    </span>
                    <button
                      onClick={() => removeFavorite(ad)}
                      title="Убрать из избранного"
                      className="text-yellow-400 hover:text-zinc-400"
                    >
                      ★
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-base leading-relaxed">{ad.text}</p>

                <div className="mt-4 flex items-center justify-between rounded-xl border border-zinc-800 bg-black px-4 py-3">
                  <div>
                    <p className="text-xs text-zinc-600">Контакт</p>
                    <p className="mt-0.5 font-medium text-green-400">{ad.contact}</p>
                  </div>
                  <button
                    onClick={() => copyContact(ad)}
                    className={`rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                      copiedId === ad.id
                        ? "border-green-800 bg-green-950 text-green-400"
                        : "border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-white"
                    }`}
                  >
                    {copiedId === ad.id ? "Скопировано" : "Копировать"}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  )
}
