import React from 'react'
import { Star } from 'lucide-react'

export function StarRating({ value, onChange, max = 5 }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }).map((_, idx) => {
        const v = idx + 1
        const active = v <= value
        return (
          <button
            key={v}
            className={
              'rounded-md p-1 ' + (active ? 'text-amber-500' : 'text-slate-300')
            }
            onClick={() => onChange?.(v)}
            aria-label={`${v} sao`}
          >
            <Star className={'h-5 w-5 ' + (active ? 'fill-amber-500' : '')} />
          </button>
        )
      })}
    </div>
  )
}
