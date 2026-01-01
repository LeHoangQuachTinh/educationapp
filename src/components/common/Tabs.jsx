import React from 'react'

export default function Tabs({ value, onChange, items }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((it) => {
        const active = it.value === value
        return (
          <button
            key={it.value}
            onClick={() => onChange(it.value)}
            className={
              'rounded-2xl px-3 py-2 text-xs font-extrabold transition ' +
              (active ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200')
            }
          >
            {it.label}
          </button>
        )
      })}
    </div>
  )
}
