import React from 'react'

export default function SectionCard({ title, subtitle, right, children, className = '' }) {
  return (
    <div className={'rounded-3xl border border-slate-100 bg-white p-5 shadow-card ' + className}>
      {(title || subtitle || right) && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div>
            {title ? <div className="text-sm font-extrabold text-slate-900">{title}</div> : null}
            {subtitle ? <div className="mt-1 text-sm text-slate-600">{subtitle}</div> : null}
          </div>
          {right ? <div>{right}</div> : null}
        </div>
      )}
      <div className={(title || subtitle || right ? 'mt-4 ' : '') + ''}>{children}</div>
    </div>
  )
}
