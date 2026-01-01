import React, { createContext, useContext, useMemo, useState } from 'react'

const ToastContext = createContext(null)

function uid(prefix = 'toast') {
  return `${prefix}_${Math.random().toString(16).slice(2)}_${Date.now()}`
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  function showToast({ title, message, tone = 'sky', duration = 2500 }) {
    const id = uid()
    setToasts((prev) => [...prev, { id, title, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }

  const value = useMemo(() => ({ toasts, showToast }), [toasts])

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastHost toasts={toasts} onDismiss={(id) => setToasts((p) => p.filter((t) => t.id !== id))} />
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

function ToastHost({ toasts, onDismiss }) {
  const toneMap = {
    sky: 'border-sky-100',
    emerald: 'border-emerald-100',
    amber: 'border-amber-100',
    rose: 'border-rose-100',
    candy: 'border-pink-100',
    lime: 'border-lime-100',
  }

  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div key={t.id} className={`rounded-3xl border bg-white p-4 shadow-card ${toneMap[t.tone] || toneMap.sky}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-extrabold text-slate-900">{t.title}</div>
              {t.message ? <div className="mt-1 text-sm text-slate-600">{t.message}</div> : null}
            </div>
            <button
              className="rounded-2xl bg-slate-100 px-3 py-1 text-xs font-extrabold text-slate-700"
              onClick={() => onDismiss(t.id)}
            >
              Đóng
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}
