"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"

const cities = ["Москва", "Санкт-Петербург"]

const districtsByCity: Record<string, string[]> = {
  Москва: ["Центр", "Пресненский", "Арбат", "Тверской"],
  "Санкт-Петербург": ["Центральный", "Петроградский", "Адмиралтейский"],
}

const metrosByCity: Record<string, string[]> = {
  Москва: ["Белорусская", "Маяковская", "Арбатская", "ВДНХ", "Кантемировская"],
  "Санкт-Петербург": ["Невский проспект", "Горьковская", "Адмиралтейская"],
}

const ageOptions = Array.from({ length: 63 }, (_, index) => String(index + 18))

function toggleItem(list: string[], item: string) {
  return list.includes(item) ? list.filter((v) => v !== item) : [...list, item]
}

export default function CreateAdPage() {
  const [text, setText] = useState("")
  const [city, setCity] = useState("")
  const [scope, setScope] = useState("city")
  const [districts, setDistricts] = useState<string[]>([])
  const [metros, setMetros] = useState<string[]>([])
  const [targetGender, setTargetGender] = useState("")
  const [targetAgeFrom, setTargetAgeFrom] = useState("")
  const [targetAgeTo, setTargetAgeTo] = useState("")
  const [contact, setContact] = useState("")
  const [checkingUser, setCheckingUser] = useState(true)
  const [balance, setBalance] = useState(0)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadUser() {
      const response = await authFetch("http://localhost:8000/users/me")
      const user = await response.json()
      setBalance(user.balance ?? 0)
      setCheckingUser(false)
    }

    loadUser()
  }, [])

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!text.trim()) { alert("Введите текст рассылки"); return }
    if (!city) { alert("Выберите город"); return }
    if (scope === "district" && districts.length === 0) { alert("Выберите хотя бы один район"); return }
    if (scope === "metro" && metros.length === 0) { alert("Выберите хотя бы одну станцию метро"); return }
    if (!targetGender) { alert("Выберите пол аудитории"); return }
    if (!targetAgeFrom || !targetAgeTo) { alert("Выберите возрастной диапазон"); return }
    if (Number(targetAgeFrom) > Number(targetAgeTo)) { alert("Возраст «от» не может быть больше возраста «до»"); return }
    if (!contact.trim()) { alert("Введите контакт отправителя"); return }

    const response = await authFetch("http://localhost:8000/ads", {
      method: "POST",
      body: JSON.stringify({
        text,
        city,
        scope,
        districts: scope === "district" ? districts : [],
        metros: scope === "metro" ? metros : [],
        target_gender: targetGender,
        target_age_from: Number(targetAgeFrom),
        target_age_to: Number(targetAgeTo),
        contact,
      }),
    })

    const result = await response.json()

    if (result.error) {
      alert(result.error)
      return
    }

    setBalance(result.balance)
    setText("")
    setDistricts([])
    setMetros([])
    setContact("")

    alert("Рассылка создана!")
  }

  const availableDistricts = city ? districtsByCity[city] ?? [] : []
  const availableMetros = city ? metrosByCity[city] ?? [] : []

  let adPrice = 300
  if (scope === "district") adPrice = Math.max(districts.length, 1) * 150
  if (scope === "metro") adPrice = Math.max(metros.length, 1) * 50

  const remainingBalance = balance - adPrice
  const canCreateAd = remainingBalance >= 0

  if (checkingUser) {
    return <main className="min-h-screen bg-black p-6 text-white">Загрузка...</main>
  }

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Создать рассылку</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-5 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div>
          <label className="block text-sm text-zinc-400">Текст рассылки</label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Например: ищу компанию погулять вечером"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Город</label>
          <select
            value={city}
            onChange={(event) => { setCity(event.target.value); setDistricts([]); setMetros([]) }}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать город</option>
            {cities.map((item) => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Куда отправить</label>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["city", "district", "metro"].map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => { setScope(s); setDistricts([]); setMetros([]) }}
                className={`rounded-xl border px-3 py-2 text-sm ${
                  scope === s ? "border-white bg-white text-black" : "border-zinc-800 bg-black text-white"
                }`}
              >
                {s === "city" ? "Весь город" : s === "district" ? "Районы" : "Метро"}
              </button>
            ))}
          </div>
        </div>

        {scope === "district" && (
          <div>
            <label className="block text-sm text-zinc-400">Выберите районы</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableDistricts.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDistricts(toggleItem(districts, item))}
                  disabled={!city}
                  className={`rounded-xl border px-3 py-2 text-sm disabled:opacity-50 ${
                    districts.includes(item) ? "border-white bg-white text-black" : "border-zinc-800 bg-black text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        {scope === "metro" && (
          <div>
            <label className="block text-sm text-zinc-400">Выберите станции метро</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {availableMetros.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMetros(toggleItem(metros, item))}
                  disabled={!city}
                  className={`rounded-xl border px-3 py-2 text-sm disabled:opacity-50 ${
                    metros.includes(item) ? "border-white bg-white text-black" : "border-zinc-800 bg-black text-white"
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-zinc-400">Кому отправить</label>
          <select
            value={targetGender}
            onChange={(event) => setTargetGender(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать пол</option>
            <option value="male">Мужчинам</option>
            <option value="female">Девушкам</option>
            <option value="all">Всем</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-zinc-400">Возраст от</label>
            <select
              value={targetAgeFrom}
              onChange={(event) => setTargetAgeFrom(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            >
              <option value="">От</option>
              {ageOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-zinc-400">Возраст до</label>
            <select
              value={targetAgeTo}
              onChange={(event) => setTargetAgeTo(event.target.value)}
              className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            >
              <option value="">До</option>
              {ageOptions.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Контакт отправителя</label>
          <input
            value={contact}
            onChange={(event) => setContact(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="@telegram или другой контакт"
          />
        </div>

        <div className="rounded-2xl border border-zinc-800 bg-black p-4">
          <p className="text-sm text-zinc-500">Баланс</p>
          <p className="mt-2 text-2xl font-bold">{balance} ₽</p>
          <div className="mt-4 space-y-1 text-sm text-zinc-400">
            <p>Стоимость рассылки: {adPrice} ₽</p>
            <p className={remainingBalance >= 0 ? "text-green-400" : "text-red-400"}>
              После отправки останется: {remainingBalance} ₽
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={!canCreateAd}
          className={`rounded-xl px-5 py-3 font-medium ${
            canCreateAd ? "bg-white text-black" : "cursor-not-allowed bg-zinc-800 text-zinc-500"
          }`}
        >
          {canCreateAd ? "Создать рассылку" : "Недостаточно средств"}
        </button>
      </form>
    </main>
  )
}
