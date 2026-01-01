import React from 'react'

export function Card({ title, right, children, className = '' }) {
  return (
    <div className={'rounded-2xl border border-slate-100 bg-white shadow-card ' + className}>
      {(title || right) && (
        <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            {title ? <div className="text-sm font-semibold">{title}</div> : null}
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      )}
      <div className="px-5 py-4">{children}</div>
    </div>
  )
}
