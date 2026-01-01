import React from 'react'

export default function Skeleton({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-100 ${className}`} />
}
