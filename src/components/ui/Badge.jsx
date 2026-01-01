import React from 'react'

export function Badge({ color = 'slate', children }) {
  const map = {
    slate: 'bg-slate-100 text-slate-700',
    emerald: 'bg-emerald-100 text-emerald-800',
    blue: 'bg-sky-100 text-sky-800',
    rose: 'bg-rose-100 text-rose-800',
    amber: 'bg-amber-100 text-amber-800',
  }
  return (
    <span className={'inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ' + (map[color] || map.slate)}>
      {children}
    </span>
  )
}
