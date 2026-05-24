"use client"

import { useEffect, useState } from "react"
import { authFetch, isAuthenticated } from "../lib/auth"

type Transaction = {
  id: number
  type: "top_up" | "ad_spend"
  amount: number
  description: string
  created_at: string | null
}

function formatDate(iso: string | null) {
  if (!iso) return "—"
  return new Date(iso).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadTransactions() {
      try {
        const response = await authFetch("http://localhost:8000/users/me/transactions")
        const data = await response.json()
        setTransactions(data)
      } catch (error) {
        console.error("Ошибка загрузки транзакций:", error)
      } finally {
        setLoading(false)
      }
    }

    loadTransactions()
  }, [])

  const totalTopUp = transactions
    .filter((t) => t.type === "top_up")
    .reduce((sum, t) => sum + t.amount, 0)

  const totalSpent = transactions
    .filter((t) => t.type === "ad_spend")
    .reduce((sum, t) => sum + t.amount, 0)

  return (
    <main className="min-h-screen bg-black p-6 text-white">
      <h1 className="text-3xl font-bold">История транзакций</h1>
      <p className="mt-2 text-zinc-400">Пополнения и списания за рассылки</p>

      {!loading && transactions.length > 0 && (
        <div className="mt-6 grid grid-cols-2 gap-4 max-w-xl">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Пополнено всего</p>
            <p className="mt-1 text-2xl font-bold text-green-400">+{totalTopUp} ₽</p>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-sm text-zinc-500">Потрачено всего</p>
            <p className="mt-1 text-2xl font-bold text-red-400">−{totalSpent} ₽</p>
          </div>
        </div>
      )}

      <div className="mt-6 max-w-xl space-y-3">
        {loading ? (
          <p className="text-zinc-500">Загрузка...</p>
        ) : transactions.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Транзакций пока нет</p>
          </div>
        ) : (
          transactions.map((tx) => (
            <div
              key={tx.id}
              className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
            >
              <div>
                <p className="text-sm text-white">{tx.description}</p>
                <p className="mt-1 text-xs text-zinc-500">{formatDate(tx.created_at)}</p>
              </div>

              <p
                className={`text-lg font-bold ${
                  tx.type === "top_up" ? "text-green-400" : "text-red-400"
                }`}
              >
                {tx.type === "top_up" ? "+" : "−"}{tx.amount} ₽
              </p>
            </div>
          ))
        )}
      </div>
    </main>
  )
}
