"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"
import { useToast } from "../components/Toast"

type User = {
  id: number
  name: string
  city: string
  districts: string[] | null
  metros: string[] | null
  gender: string
  age: number
  balance: number
  inbox_unlocked: boolean
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

type Filter = "all" | "city" | "district" | "metro"

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"
  return "Не указано"
}

function formatGeo(scope: string, districts: string[], metros: string[]) {
  if (scope === "city") return "Весь город"
  if (scope === "district") return districts.length > 0 ? districts.join(", ") : "Районы не указаны"
  if (scope === "metro") return metros.length > 0 ? metros.join(", ") : "Метро не указано"
  return "—"
}

function getScopeLabel(scope: string) {
  if (scope === "city") return "Город"
  if (scope === "district") return "Район"
  if (scope === "metro") return "Метро"
  return scope
}

function getScopeBadgeStyle(scope: string) {
  if (scope === "city") return "bg-blue-950 text-blue-400 border-blue-800"
  if (scope === "district") return "bg-purple-950 text-purple-400 border-purple-800"
  if (scope === "metro") return "bg-orange-950 text-orange-400 border-orange-800"
  return "bg-zinc-900 text-zinc-400 border-zinc-700"
}

function formatReceiveScope(user: User) {
  if (user.receive_scope === "city") return `${user.city} — весь город`
  if (user.receive_scope === "district") return `${user.city} — ${(user.districts ?? []).join(", ")}`
  if (user.receive_scope === "metro") return `${user.city} — ${(user.metros ?? []).join(", ")}`
  return "Настройки не указаны"
}

export default function InboxPage() {
  const toast = useToast()
  const [user, setUser] = useState<User | null>(null)
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<Filter>("all")
  const [copiedId, setCopiedId] = useState<number | null>(null)
  const [favorites, setFavorites] = useState<Set<number>>(new Set())
  const [ignored, setIgnored] = useState<Set<number>>(new Set())

  async function loadInbox() {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    const [userRes, inboxRes, ignoredRes, favRes] = await Promise.all([
      authFetch("/api/users/me"),
      authFetch("/api/users/me/inbox"),
      authFetch("/api/users/me/ignored-ids"),
      authFetch("/api/users/me/favorite-ids"),
    ])

    const userData = await userRes.json()
    if (!userData || userData.detail) {
      window.location.href = "/login"
      return
    }
    setUser(userData)

    if (userData.inbox_unlocked) {
      const [inboxData, ignoredData, favData] = await Promise.all([
        inboxRes.json(),
        ignoredRes.json(),
        favRes.json(),
      ])
      setAds(inboxData)
      setIgnored(new Set(ignoredData))
      setFavorites(new Set(favData))
    }

    setLoading(false)
  }

  useEffect(() => {
    loadInbox()
  }, [])

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

  async function toggleFavorite(ad: Ad) {
    const isFav = favorites.has(ad.id)

    if (isFav) {
      await authFetch(`/api/ads/${ad.id}/favorite`, { method: "DELETE" })
      setFavorites((prev) => { const s = new Set(prev); s.delete(ad.id); return s })
      toast("Убрано из избранного", "info")
    } else {
      await authFetch(`/api/ads/${ad.id}/favorite`, { method: "POST" })
      setFavorites((prev) => new Set(prev).add(ad.id))
      toast("Добавлено в избранное", "success")
    }
  }

  async function ignoreAd(ad: Ad) {
    await authFetch(`/api/ads/${ad.id}/ignore`, { method: "POST" })
    setIgnored((prev) => new Set(prev).add(ad.id))
    toast("Рассылка скрыта", "info")
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="flex items-center gap-3 text-zinc-500">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-700 border-t-white" />
          Загрузка входящих...
        </div>
      </main>
    )
  }

  if (!user) {
    return <main className="min-h-screen bg-black p-6 text-white">Сначала зарегистрируйтесь.</main>
  }

  if (!user.inbox_unlocked) {
    return (
      <main className="min-h-screen bg-black p-6 text-white">
        <div className="mx-auto mt-20 max-w-lg rounded-2xl border border-zinc-800 bg-zinc-950 p-10 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-zinc-700 bg-zinc-900 text-3xl">
            🔒
          </div>
          <h1 className="mt-6 text-2xl font-bold">Входящие закрыты</h1>
          <p className="mt-3 text-sm text-zinc-400">
            Пополни баланс один раз — и получишь доступ к контактам отправителей навсегда.
          </p>
          <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4 text-left">
            <p className="text-xs text-zinc-500">Минимальный платёж</p>
            <p className="mt-1 text-2xl font-bold">500 ₽</p>
          </div>
          <button
            onClick={async () => {
              const res = await authFetch("/api/users/me/top-up", {
                method: "POST",
                body: JSON.stringify({ amount: 500 }),
              })
              const result = await res.json()
              if (result.error) {
                toast(result.error, "error")
              } else {
                window.location.reload()
              }
            }}
            className="mt-6 w-full rounded-xl bg-white py-3 font-medium text-black"
          >
            Пополнить на 500 ₽
          </button>
        </div>
      </main>
    )
  }

  const visibleAds = ads.filter((ad) => !ignored.has(ad.id))
  const filteredAds = filter === "all" ? visibleAds : visibleAds.filter((ad) => ad.scope === filter)

  const counts = {
    all: visibleAds.length,
    city: visibleAds.filter((a) => a.scope === "city").length,
    district: visibleAds.filter((a) => a.scope === "district").length,
    metro: visibleAds.filter((a) => a.scope === "metro").length,
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="max-w-2xl">

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">Входящие</h1>
            <p className="mt-1 text-sm text-zinc-500">{formatReceiveScope(user)}</p>
          </div>
          <div className="flex items-center gap-2">
            {visibleAds.length > 0 && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 px-3 py-1.5 text-sm text-zinc-400">
                {visibleAds.length} {visibleAds.length === 1 ? "рассылка" : visibleAds.length < 5 ? "рассылки" : "рассылок"}
              </div>
            )}
            {favorites.size > 0 && (
              <a
                href="/favorites"
                className="rounded-xl border border-yellow-800 bg-yellow-950 px-3 py-1.5 text-sm text-yellow-400"
              >
                ★ {favorites.size}
              </a>
            )}
            {ignored.size > 0 && (
              <a
                href="/ignored"
                className="rounded-xl border border-zinc-700 bg-zinc-900 px-3 py-1.5 text-sm text-zinc-500 hover:text-white"
              >
                Скрытые {ignored.size}
              </a>
            )}
          </div>
        </div>

        {visibleAds.length > 0 && (
          <div className="mt-5 flex gap-2">
            {(["all", "city", "district", "metro"] as Filter[]).map((f) =>
              counts[f] > 0 || f === "all" ? (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                    filter === f
                      ? "border-white bg-white text-black"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
                  }`}
                >
                  {f === "all" ? "Все" : getScopeLabel(f)}
                  {counts[f] > 0 && (
                    <span className={`ml-1.5 text-xs ${filter === f ? "text-zinc-500" : "text-zinc-600"}`}>
                      {counts[f]}
                    </span>
                  )}
                </button>
              ) : null
            )}
          </div>
        )}

        <div className="mt-6 space-y-3">
          {filteredAds.length === 0 ? (
            <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-8 text-center">
              <p className="text-zinc-500">
                {ads.length === 0 ? "Пока нет подходящих рассылок" : "Нет рассылок с таким фильтром"}
              </p>
            </div>
          ) : (
            filteredAds.map((ad) => (
              <div
                key={ad.id}
                className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center rounded-lg border px-2 py-0.5 text-xs font-medium ${getScopeBadgeStyle(ad.scope)}`}>
                    {getScopeLabel(ad.scope)} — {formatGeo(ad.scope, ad.districts || [], ad.metros || [])}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-zinc-600">
                      {formatGender(ad.target_gender)}, {ad.target_age_from}–{ad.target_age_to} лет
                    </span>
                    {/* Избранное */}
                    <button
                      onClick={() => toggleFavorite(ad)}
                      title={favorites.has(ad.id) ? "Убрать из избранного" : "В избранное"}
                      className={`rounded-lg p-1.5 text-sm transition-colors ${
                        favorites.has(ad.id)
                          ? "text-yellow-400"
                          : "text-zinc-600 hover:text-yellow-400"
                      }`}
                    >
                      ★
                    </button>
                    {/* Игнор */}
                    <button
                      onClick={() => ignoreAd(ad)}
                      title="Скрыть рассылку"
                      className="rounded-lg p-1.5 text-sm text-zinc-600 transition-colors hover:text-red-400"
                    >
                      ✕
                    </button>
                  </div>
                </div>

                <p className="mt-3 text-base leading-relaxed text-white">{ad.text}</p>

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
