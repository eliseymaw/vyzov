import Link from "next/link"

type AdCardProps = {
  id: number
  text: string
  city: string
  scope: string
  districts: string[]
  metros: string[]
  targetGender: string
  targetAgeFrom: number
  targetAgeTo: number
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
    return districts.length > 0
      ? districts.join(", ")
      : "Районы не выбраны"
  }

  if (scope === "metro") {
    return metros.length > 0
      ? `м. ${metros.join(", м. ")}`
      : "Метро не выбрано"
  }

  return "Гео не указано"
}

export function AdCard({
  id,
  text,
  city,
  scope,
  districts,
  metros,
  targetGender,
  targetAgeFrom,
  targetAgeTo,
}: AdCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-lg text-white">{text}</p>

      <div className="mt-4 text-sm text-zinc-400">
        {city} • {formatGeo(scope, districts || [], metros || [])}
      </div>

      <div className="mt-3 text-sm text-zinc-500">
        Кому: {formatGender(targetGender)} • Возраст:{" "}
        {targetAgeFrom}–{targetAgeTo}
      </div>

      <Link
        href={`/ads/${id}`}
        className="mt-5 inline-block rounded-xl bg-white px-4 py-2 font-medium text-black"
      >
        Открыть рассылку
      </Link>
    </div>
  )
}