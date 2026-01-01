import React from 'react'

export default function Card({ title, right, children, className = '' }) {
  return (
    <div className={'rounded-3xl border border-slate-100 bg-white p-5 shadow-card ' + className}>
      {title || right ? (
        <div className="flex items-center justify-between gap-3">
          <div className="text-lg font-extrabold">{title}</div>
          {right}
        </div>
      ) : null}
      <div className={(title || right ? 'mt-4 ' : '') + ''}>{children}</div>
    </div>
  )
}
