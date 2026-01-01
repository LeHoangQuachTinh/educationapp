import React from 'react'

export default function Input({ className = '', ...props }) {
  return (
    <input
      className={
        'w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:border-sky-400 focus:ring-4 focus:ring-sky-100 ' +
        className
      }
      {...props}
    />
  )
}
