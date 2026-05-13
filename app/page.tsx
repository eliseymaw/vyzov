import { AdCard } from "./components/AdCard"

type Ad = {
  id: number
  text: string
  city: string
  district: string | null
  metro: string | null
  target_gender: string
  target_age_from: string
  target_age_to: string
}

async function getAds(): Promise<Ad[]> {
  const response = await fetch("http://localhost:8000/ads", {
    cache: "no-store",
  })

  return response.json()
}

export default async function Home() {
  const ads = await getAds()

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-4xl font-bold">ВЫЗОВ</h1>

      <p className="mt-2 text-zinc-400">Публичная лента рассылок</p>

      <div className="mt-8 space-y-4">
        {ads.length === 0 ? (
          <p className="text-zinc-500">Пока рассылок нет</p>
        ) : (
          ads.map((ad) => (
            <AdCard
              key={ad.id}
              id={ad.id}
              text={ad.text}
              city={ad.city}
              district={ad.district}
              metro={ad.metro}
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