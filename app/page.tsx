import { AdCard } from "./components/AdCard"

type Ad = {
  text: string
  city: string
  gender: string
  age: string
  contact: string
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
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-4xl font-bold">ВЫЗОВ</h1>

      <p className="mt-2 text-zinc-400">Лента объявлений</p>

      <div className="mt-8 space-y-4">
        {ads.length === 0 ? (
          <p className="text-zinc-500">Пока объявлений нет</p>
        ) : (
          ads.map((ad, index) => (
            <AdCard
              key={index}
              text={ad.text}
              city={ad.city}
              gender={ad.gender}
              age={Number(ad.age)}
              contact={ad.contact}
            />
          ))
        )}
      </div>
    </main>
  )
}