import React from 'react'

export function Tabs({ items, value, onChange }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={
              'rounded-xl px-3 py-2 text-sm font-semibold ' +
              (active
                ? 'bg-slate-900 text-white'
                : 'bg-white text-slate-700 ring-1 ring-slate-200 hover:bg-slate-50')
            }
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
