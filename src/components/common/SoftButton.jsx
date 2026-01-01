import React from 'react'

export default function SoftButton({ tone = 'slate', className = '', ...props }) {
  const tones = {
    slate: 'bg-slate-100 text-slate-800 hover:bg-slate-200',
    sky: 'bg-sky-100 text-sky-900 hover:bg-sky-200',
    emerald: 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200',
    amber: 'bg-amber-100 text-amber-900 hover:bg-amber-200',
    rose: 'bg-rose-100 text-rose-900 hover:bg-rose-200',
  }

  return (
    <button
      className={
        'inline-flex items-center justify-center gap-2 rounded-2xl px-3 py-2 text-xs font-extrabold transition ' +
        (tones[tone] || tones.slate) +
        ' ' +
        className
      }
      {...props}
    />
  )
}
