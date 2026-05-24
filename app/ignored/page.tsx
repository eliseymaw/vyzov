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

function formatGeo(scope: string, districts: string[] | null, metros: string[] | null) {
  if (scope === "city") return "Весь город"
  if (scope === "district") return (districts ?? []).join(", ") || "—"
  if (scope === "metro") return (metros ?? []).join(", ") || "—"
  return "—"
}

export default function IgnoredPage() {
  const toast = useToast()
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadIgnored() {
      try {
        const response = await authFetch("http://localhost:8000/users/me/ignored")
        const data = await response.json()
        setAds(data)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    loadIgnored()
  }, [])

  async function unignore(ad: Ad) {
    await authFetch(`http://localhost:8000/ads/${ad.id}/ignore`, { method: "DELETE" })
    setAds((prev) => prev.filter((a) => a.id !== ad.id))
    toast("Рассылка возвращена во входящие", "success")
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-2xl">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Скрытые</h1>
            <p className="mt-1 text-sm text-zinc-500">Рассылки, которые ты скрыл из входящих</p>
          </div>
          <a href="/inbox" className="text-sm text-zinc-500 hover:text-white">
            ← Входящие
          </a>
        </div>

        <div className="mt-8 space-y-3">
          {loading ? (
            <p className="text-zinc-500">Загрузка...</p>
          ) : ads.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="text-zinc-400">Скрытых рассылок нет</p>
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
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 opacity-60"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <p className="text-sm text-zinc-500">
                      {ad.city} · {formatGeo(ad.scope, ad.districts, ad.metros)}
                    </p>
                    <p className="mt-2 text-base text-white">{ad.text}</p>
                  </div>

                  <button
                    onClick={() => unignore(ad)}
                    className="shrink-0 rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-xs text-zinc-400 transition-colors hover:border-white hover:text-white"
                  >
                    Вернуть
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
