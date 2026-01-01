import React from 'react'
import { CalendarDays } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'

const DAYS = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6']
const SLOTS = ['Tiết 1', 'Tiết 2', 'Tiết 3', 'Tiết 4', 'Tiết 5']

const MOCK = {
  '0_0': 'Toán: Phân số',
  '0_1': 'Tiếng Việt: Kể chuyện',
  '1_0': 'Toán: Tỉ số',
  '2_2': 'Khoa học: Hệ hô hấp',
  '3_0': 'Mỹ thuật',
  '4_1': 'Âm nhạc',
}

export default function Timetable() {
  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4">
      <PageHeader
        title="Lịch học"
        subtitle="Xem thời khoá biểu trong tuần."
        right={<Badge tone="sky"><CalendarDays className="mr-1 inline h-4 w-4" /> Tuần này</Badge>}
      />

      <div className="overflow-auto rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="min-w-[820px] p-4">
          <div className="grid grid-cols-[140px_repeat(5,minmax(120px,1fr))] gap-2">
            <div />
            {DAYS.map((d) => (
              <div key={d} className="rounded-2xl bg-slate-900 px-3 py-2 text-xs font-extrabold text-white">
                {d}
              </div>
            ))}

            {SLOTS.map((slot, sIdx) => (
              <React.Fragment key={slot}>
                <div className="rounded-2xl border border-slate-100 bg-white px-3 py-3">
                  <div className="text-sm font-extrabold">{slot}</div>
                  <div className="text-xs text-slate-500">07:30 – 11:25</div>
                </div>

                {DAYS.map((_, dIdx) => {
                  const key = `${dIdx}_${sIdx}`
                  const label = MOCK[key]
                  return (
                    <div key={key} className="rounded-3xl border border-slate-100 bg-slate-50 p-4">
                      <div className="text-xs font-semibold text-slate-600">{label ? 'Môn học' : '—'}</div>
                      <div className="mt-1 text-sm font-extrabold text-slate-900">{label || 'Trống'}</div>
                    </div>
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
