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

type Filter = "all" | "top_up" | "ad_spend"

const PAGE_SIZE = 20

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
  const [filter, setFilter] = useState<Filter>("all")
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = "/register"
      return
    }

    async function loadTransactions() {
      try {
        const response = await authFetch("/api/users/me/transactions")
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

  // Сбрасываем страницу при смене фильтра
  useEffect(() => {
    setPage(1)
  }, [filter])

  const filtered = filter === "all"
    ? transactions
    : transactions.filter((t) => t.type === filter)

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE)
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

      {/* Фильтры */}
      {!loading && transactions.length > 0 && (
        <div className="mt-5 flex gap-2">
          {(["all", "top_up", "ad_spend"] as Filter[]).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-xl border px-3 py-1.5 text-sm transition-colors ${
                filter === f
                  ? "border-white bg-white text-black"
                  : "border-zinc-800 bg-zinc-950 text-zinc-400 hover:border-zinc-600"
              }`}
            >
              {f === "all" ? "Все" : f === "top_up" ? "Пополнения" : "Списания"}
              <span className={`ml-1.5 text-xs ${filter === f ? "text-zinc-500" : "text-zinc-600"}`}>
                {f === "all" ? transactions.length : transactions.filter((t) => t.type === f).length}
              </span>
            </button>
          ))}
        </div>
      )}

      <div className="mt-4 max-w-xl space-y-2">
        {loading ? (
          <p className="text-zinc-500">Загрузка...</p>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
            <p className="text-zinc-400">Транзакций пока нет</p>
          </div>
        ) : (
          <>
            {paginated.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-2xl border border-zinc-800 bg-zinc-950 px-5 py-4"
              >
                <div>
                  <p className="text-sm text-white">{tx.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">{formatDate(tx.created_at)}</p>
                </div>

                <p className={`text-lg font-bold ${tx.type === "top_up" ? "text-green-400" : "text-red-400"}`}>
                  {tx.type === "top_up" ? "+" : "−"}{tx.amount} ₽
                </p>
              </div>
            ))}

            {/* Пагинация */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 disabled:opacity-30 hover:border-zinc-600 hover:text-white disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
                >
                  ← Назад
                </button>

                <p className="text-sm text-zinc-500">
                  {page} / {totalPages}
                  <span className="ml-2 text-zinc-600">({filtered.length} записей)</span>
                </p>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="rounded-xl border border-zinc-800 px-4 py-2 text-sm text-zinc-400 disabled:opacity-30 hover:border-zinc-600 hover:text-white disabled:hover:border-zinc-800 disabled:hover:text-zinc-400"
                >
                  Вперёд →
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
