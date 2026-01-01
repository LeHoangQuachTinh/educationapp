import React from 'react'
import PageHeader from '../../components/common/PageHeader'

export default function ParentTimetable() {
  return (
    <div className="space-y-4">
      <PageHeader title="Lịch học" subtitle="Xem lịch học của con (mock)." />
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="text-sm font-semibold text-slate-700">Tuần này</div>
        <div className="mt-2 text-sm text-slate-600">
          Thứ 2: Toán, Tiếng Việt · Thứ 3: Toán, Khoa học · Thứ 4: Tiếng Việt, Tin học · ...
        </div>
      </div>
    </div>
  )
}
