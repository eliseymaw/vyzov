"use client"

import { useState } from "react"

type AdCardProps = {
  text: string
  city: string
  gender: string
  age: number
  contact: string
}

export function AdCard({ text, city, gender, age, contact }: AdCardProps) {
  const [showContact, setShowContact] = useState(false)

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="text-lg">{text}</p>

      <div className="mt-4 flex gap-3 text-sm text-zinc-400">
        <span>{city}</span>
        <span>{gender}</span>
        <span>{age} лет</span>
      </div>

      {showContact ? (
        <div className="mt-5 text-green-400">{contact}</div>
      ) : (
        <button
          onClick={() => setShowContact(true)}
          className="mt-5 rounded-xl bg-white px-4 py-2 text-black"
        >
          Показать контакт
        </button>
      )}
    </div>
  )
}