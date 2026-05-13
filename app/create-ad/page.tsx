"use client"

import { useState } from "react"

const cities = ["Москва", "Санкт-Петербург"]

const districtsByCity: Record<string, string[]> = {
  Москва: ["Центр", "Пресненский", "Арбат", "Тверской"],
  "Санкт-Петербург": ["Центральный", "Петроградский", "Адмиралтейский"],
}

const metrosByCity: Record<string, string[]> = {
  Москва: ["Белорусская", "Маяковская", "Арбатская", "ВДНХ"],
  "Санкт-Петербург": ["Невский проспект", "Горьковская", "Адмиралтейская"],
}

const ageOptions = Array.from({ length: 63 }, (_, index) => String(index + 18))

export default function CreateAdPage() {
  const [text, setText] = useState("")
  const [city, setCity] = useState("")
  const [district, setDistrict] = useState("")
  const [metro, setMetro] = useState("")
  const [targetGender, setTargetGender] = useState("")
  const [targetAgeFrom, setTargetAgeFrom] = useState("")
  const [targetAgeTo, setTargetAgeTo] = useState("")
  const [contact, setContact] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const ad = {
      text,
      city,
      district,
      metro,
      target_gender: targetGender,
      target_age_from: targetAgeFrom,
      target_age_to: targetAgeTo,
      contact,
    }

    const response = await fetch("http://localhost:8000/ads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(ad),
    })

    const result = await response.json()

    console.log("Ответ backend:", result)

    alert("Рассылка отправлена на backend")
  }

  const districts = city ? districtsByCity[city] ?? [] : []
  const metros = city ? metrosByCity[city] ?? [] : []

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">Создать рассылку</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
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
            onChange={(event) => {
              setCity(event.target.value)
              setDistrict("")
              setMetro("")
            }}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать город</option>
            {cities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Район</label>
          <select
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            disabled={!city}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white disabled:opacity-50"
          >
            <option value="">Выбрать район</option>
            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Метро</label>
          <select
            value={metro}
            onChange={(event) => setMetro(event.target.value)}
            disabled={!city}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white disabled:opacity-50"
          >
            <option value="">Выбрать метро</option>
            {metros.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

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
              {ageOptions.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
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
              {ageOptions.map((age) => (
                <option key={age} value={age}>
                  {age}
                </option>
              ))}
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

        <button
          type="submit"
          className="rounded-xl bg-white px-5 py-3 font-medium text-black"
        >
          Создать рассылку
        </button>
      </form>
    </main>
  )
}