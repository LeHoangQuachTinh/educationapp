import React from 'react'

export default function Badge({ tone = 'slate', className = '', children }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-700',
    sky: 'bg-sky-100 text-sky-800',
    emerald: 'bg-emerald-100 text-emerald-800',
    amber: 'bg-amber-100 text-amber-800',
    rose: 'bg-rose-100 text-rose-800',
    violet: 'bg-violet-100 text-violet-800',
    // student playful
    candy: 'bg-pink-100 text-pink-800',
    lime: 'bg-lime-100 text-lime-800',
  }

  return (
    <span
      className={
        'inline-flex items-center rounded-full px-3 py-1 text-xs font-extrabold ' +
        (tones[tone] || tones.slate) +
        ' ' +
        className
      }
    >
      {children}
    </span>
  )
}
