type Ad = {
  id: number
  text: string
  city: string
  district: string | null
  metro: string | null
  target_gender: string
  target_age_from: string
  target_age_to: string
  contact: string
}

async function getAds(): Promise<Ad[]> {
  const response = await fetch("http://localhost:8000/ads", {
    cache: "no-store",
  })

  return response.json()
}

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"

  return "Не указано"
}

export default async function InboxPage() {
  const ads = await getAds()

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-4xl font-bold">Входящие рассылки</h1>

      <p className="mt-2 text-zinc-400">
        Здесь будут рассылки, подходящие пользователю по городу, полу и возрасту.
      </p>

      <div className="mt-8 space-y-4">
        {ads.length === 0 ? (
          <p className="text-zinc-500">Входящих пока нет</p>
        ) : (
          ads.map((ad) => (
            <div
              key={ad.id}
              className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
            >
              <p className="text-lg">{ad.text}</p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-400">
                <span>{ad.city}</span>
                {ad.district && <span>• {ad.district}</span>}
                {ad.metro && <span>• м. {ad.metro}</span>}
              </div>

              <div className="mt-3 text-sm text-zinc-500">
                Кому: {formatGender(ad.target_gender)} • Возраст:{" "}
                {ad.target_age_from}–{ad.target_age_to}
              </div>

              <div className="mt-6 rounded-xl border border-zinc-800 bg-black p-4">
                <p className="text-sm text-zinc-500">Контакт отправителя</p>
                <p className="mt-2 text-green-400">{ad.contact}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </main>
  )
}