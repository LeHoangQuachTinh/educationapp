import React, { useMemo } from 'react'
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import PageHeader from '../../components/common/PageHeader'

function DayChip({ label, present }) {
  return (
    <div
      className={
        'flex h-10 items-center justify-center rounded-2xl text-xs font-semibold ' +
        (present ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-500')
      }
      title={present ? 'Có mặt' : '—'}
    >
      {label}
    </div>
  )
}

export default function StudentReport() {
  // mock weekly report
  const totalWeekPoints = 23

  const chartData = useMemo(
    () => [
      { day: 'T2', points: 5 },
      { day: 'T3', points: 3 },
      { day: 'T4', points: 7 },
      { day: 'T5', points: 0 },
      { day: 'T6', points: 8 },
    ],
    [],
  )

  const days = useMemo(
    () => [
      { d: 'T2', present: true },
      { d: 'T3', present: true },
      { d: 'T4', present: true },
      { d: 'T5', present: false },
      { d: 'T6', present: true },
      { d: 'T7', present: false },
      { d: 'CN', present: false },
    ],
    [],
  )

  return (
    <div className="space-y-4">
      <PageHeader title="Báo cáo" subtitle="Tổng hợp điểm và điểm danh (mock + Recharts)." />

      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="text-sm font-semibold text-slate-700">Points Summary (tuần này)</div>
        <div className="mt-2 text-4xl font-extrabold text-slate-900">{totalWeekPoints}</div>
        <div className="mt-1 text-sm text-slate-600">điểm đạt được</div>

        <div className="mt-4 h-[220px] w-full rounded-2xl bg-slate-50 p-3">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <XAxis dataKey="day" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} />
              <Tooltip />
              <Bar dataKey="points" fill="#0284c7" radius={[10, 10, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-6">
          <div className="text-sm font-semibold text-slate-700">Attendance</div>
          <div className="mt-2 grid grid-cols-7 gap-2">
            {days.map((x) => (
              <DayChip key={x.d} label={x.d} present={x.present} />
            ))}
          </div>
          <div className="mt-3 text-xs text-slate-600">Màu xanh: Có mặt</div>
        </div>
      </div>
    </div>
  )
}
