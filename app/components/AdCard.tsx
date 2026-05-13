import Link from "next/link"

type AdCardProps = {
  id: number
  text: string
  city: string
  district: string | null
  metro: string | null
  targetGender: string
  targetAgeFrom: string
  targetAgeTo: string
}

function formatGender(gender: string) {
  if (gender === "male") return "Мужчинам"
  if (gender === "female") return "Девушкам"
  if (gender === "all") return "Всем"

  return "Не указано"
}

export function AdCard({
  id,
  text,
  city,
  district,
  metro,
  targetGender,
  targetAgeFrom,
  targetAgeTo,
}: AdCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-lg text-white">{text}</p>

      <div className="mt-4 flex flex-wrap gap-2 text-sm text-zinc-400">
        <span>{city}</span>

        {district && <span>• {district}</span>}

        {metro && <span>• м. {metro}</span>}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-500">
        <span>Кому: {formatGender(targetGender)}</span>
        <span>
          • Возраст: {targetAgeFrom}–{targetAgeTo}
        </span>
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