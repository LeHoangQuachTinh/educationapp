import React from 'react'

export function ToastHost({ toasts, onDismiss }) {
  return (
    <div className="fixed right-4 top-4 z-[60] flex w-[min(420px,calc(100vw-2rem))] flex-col gap-2">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={
            "rounded-2xl border bg-white p-4 shadow-card " +
            (t.type === 'success'
              ? 'border-emerald-100'
              : t.type === 'danger'
                ? 'border-rose-100'
                : 'border-slate-100')
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">{t.title}</div>
              {t.message ? (
                <div className="mt-1 text-sm text-slate-600">{t.message}</div>
              ) : null}
            </div>
            <button
              className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
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
