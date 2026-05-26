"use client"

import { useEffect, useState } from "react"
import { AdCard } from "./components/AdCard"
import { isAuthenticated } from "./lib/auth"

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
}

export default function Home() {
  const [ads, setAds] = useState<Ad[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadAds() {
      try {
        const response = await fetch("/api/ads")
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
      <h1 className="text-4xl font-bold">ВЫЗОВ</h1>

      <p className="mt-2 text-zinc-400">Публичная лента рассылок</p>

      <div className="mt-8 space-y-4">
        {loading ? (
          <p className="text-zinc-500">Загрузка...</p>
        ) : ads.length === 0 ? (
          <p className="text-zinc-500">Пока рассылок нет</p>
        ) : (
          ads.map((ad) => (
            <AdCard
              key={ad.id}
              id={ad.id}
              text={ad.text}
              city={ad.city}
              scope={ad.scope}
              districts={ad.districts}
              metros={ad.metros}
              targetGender={ad.target_gender}
              targetAgeFrom={ad.target_age_from}
              targetAgeTo={ad.target_age_to}
            />
          ))
        )}
      </div>
    </main>
  )
}
