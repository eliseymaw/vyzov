"use client"

import { useState } from "react"

export default function CreateAdPage() {
  const [text, setText] = useState("")
  const [city, setCity] = useState("")
  const [gender, setGender] = useState("")
  const [age, setAge] = useState("")
  const [contact, setContact] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const ad = {
      text,
      city,
      gender,
      age,
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

    alert("Объявление отправлено на backend")
  }

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold">Создать объявление</h1>

      <form
        onSubmit={handleSubmit}
        className="mt-6 max-w-xl space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-5"
      >
        <div>
          <label className="block text-sm text-zinc-400">
            Текст объявления
          </label>
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            className="mt-2 min-h-32 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Например: ищу компанию на вечер"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Город</label>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="Москва"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Пол</label>
          <select
            value={gender}
            onChange={(event) => setGender(event.target.value)}
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
          >
            <option value="">Выбрать</option>
            <option value="male">Мужчина</option>
            <option value="female">Девушка</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Возраст</label>
          <input
            value={age}
            onChange={(event) => setAge(event.target.value)}
            type="number"
            className="mt-2 w-full rounded-xl border border-zinc-800 bg-black p-3 text-white"
            placeholder="25"
          />
        </div>

        <div>
          <label className="block text-sm text-zinc-400">Контакт</label>
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
          Создать объявление
        </button>
      </form>
    </main>
  )
}