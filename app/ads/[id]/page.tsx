type Ad = {
  id: number
  text: string
  city: string
  scope: string
  districts: string[]
  metros: string[]
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

function formatGeo(scope: string, districts: string[], metros: string[]) {
  if (scope === "city") return "Весь город"

  if (scope === "district") {
    return districts.length > 0 ? districts.join(", ") : "Районы не указаны"
  }

  if (scope === "metro") {
    return metros.length > 0 ? `м. ${metros.join(", м. ")}` : "Метро не указано"
  }

  return "Гео не указано"
}

async function getAd(id: string): Promise<Ad> {
  const response = await fetch(`/api/ads/${id}`, {
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
          <p>Гео: {formatGeo(ad.scope, ad.districts || [], ad.metros || [])}</p>
          <p>Кому: {formatGender(ad.target_gender)}</p>
          <p>
            Возраст: {ad.target_age_from}–{ad.target_age_to}
          </p>
        </div>

        <div className="mt-8 rounded-xl border border-zinc-800 bg-black p-4">
          <p className="text-sm text-zinc-500">
            Контакты доступны только во входящих после пополнения баланса.
          </p>
        </div>
      </div>
    </main>
  )
}