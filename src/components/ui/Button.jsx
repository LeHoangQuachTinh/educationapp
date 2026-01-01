import React from 'react'

export function Button({ variant = 'primary', className = '', ...props }) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition active:translate-y-[1px] disabled:opacity-50 disabled:pointer-events-none'
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    danger: 'bg-rose-600 text-white hover:bg-rose-700',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
    outline: 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
