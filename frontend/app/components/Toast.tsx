"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react"

type ToastType = "success" | "error" | "info"

type Toast = {
  id: number
  message: string
  type: ToastType
}

type ToastContextValue = {
  toast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map())

  const remove = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
    timers.current.delete(id)
  }, [])

  const toast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type }])

      const timer = setTimeout(() => remove(id), 3000)
      timers.current.set(id, timer)
    },
    [remove]
  )

  useEffect(() => {
    const t = timers.current
    return () => t.forEach((timer) => clearTimeout(timer))
  }, [])

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "i",
  }

  const colors: Record<ToastType, string> = {
    success: "border-green-500 bg-zinc-900 text-green-400",
    error: "border-red-500 bg-zinc-900 text-red-400",
    info: "border-zinc-600 bg-zinc-900 text-zinc-300",
  }

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}

      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg transition-all ${colors[t.type]}`}
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
              {icons[t.type]}
            </span>

            <p className="text-sm text-white">{t.message}</p>

            <button
              onClick={() => remove(t.id)}
              className="ml-2 text-zinc-500 hover:text-white"
            >
              ✕
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToast must be used inside ToastProvider")
  return ctx.toast
}
