import React from 'react'
import { Trophy } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'

const MOCK = [
  { name: 'Nguyễn Văn A', points: 150, badge: 'Chăm ngoan', icon: '🦊' },
  { name: 'Trần Thị Lan', points: 142, badge: 'Chăm chỉ', icon: '🐯' },
  { name: 'Lê Văn Tâm', points: 135, badge: 'Sáng tạo', icon: '🐼' },
  { name: 'Phạm Quốc Bảo', points: 121, badge: 'Kỷ luật', icon: '🦁' },
]

export default function Leaderboard() {
  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4">
      <PageHeader
        title="Bảng xếp hạng"
        subtitle="Top học sinh trong tuần (mock)."
        right={<Badge tone="amber"><Trophy className="mr-1 inline h-4 w-4" /> Top</Badge>}
      />

      <div className="space-y-3">
        {MOCK.map((x, idx) => (
          <div key={x.name} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-2xl">
                  {x.icon}
                </div>
                <div>
                  <div className="text-xs font-semibold text-slate-600">#{idx + 1}</div>
                  <div className="mt-1 text-sm font-extrabold text-slate-900">{x.name}</div>
                  <div className="mt-2">
                    <Badge tone={idx === 0 ? 'candy' : idx === 1 ? 'lime' : 'sky'}>🏅 {x.badge}</Badge>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl bg-gradient-to-r from-sky-600 to-orange-500 px-3 py-2 text-sm font-extrabold text-white">
                {x.points}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
