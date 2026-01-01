import React from 'react'

export default function Button({ className = '', variant = 'primary', ...props }) {
  const base =
    'inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-extrabold transition disabled:opacity-50'
  const variants = {
    primary: 'bg-sky-600 text-white hover:bg-sky-700',
    orange: 'bg-orange-500 text-white hover:bg-orange-600',
    outline: 'border border-slate-200 bg-white text-slate-800 hover:bg-slate-50',
    ghost: 'bg-transparent text-slate-700 hover:bg-slate-100',
  }
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />
}
