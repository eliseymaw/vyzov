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

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"

  return "Не указано"
}

async function getAd(id: string): Promise<Ad> {
  const response = await fetch(`http://localhost:8000/ads/${id}`, {
    cache: "no-store",
  })

  return response.json()
}

export default async function AdPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const ad = await getAd(id)

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <div className="mx-auto max-w-2xl rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <h1 className="text-3xl font-bold">Рассылка #{ad.id}</h1>

        <p className="mt-6 text-lg">{ad.text}</p>

        <div className="mt-6 space-y-2 text-zinc-400">
          <p>Город: {ad.city}</p>
          <p>Район: {ad.district || "Не указан"}</p>
          <p>Метро: {ad.metro || "Не указано"}</p>
          <p>Кому: {formatGender(ad.target_gender)}</p>
          <p>
            Возраст: {ad.target_age_from}–{ad.target_age_to}
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-black p-4">
          <p className="text-sm text-zinc-500">
            Контакты доступны только в личном кабинете после активации доступа.
          </p>
        </div>
      </div>
    </main>
  )
}