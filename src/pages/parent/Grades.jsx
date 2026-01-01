import React, { useEffect, useState } from 'react'
import { TrendingUp } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import SectionCard from '../../components/common/SectionCard'

import { useAuth } from '../../context/AuthContext'
import { gradeService } from '../../services/mock/gradeService'

export default function ParentGrades() {
  const { user } = useAuth()
  const childStudentId = user?.childId

  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const d = await gradeService.getStudentGrades(childStudentId, 'HK1')
      if (!mounted) return
      setData(d)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [childStudentId])

  return (
    <div className="space-y-4">
      <PageHeader
        title="Bảng điểm của con"
        subtitle="Theo dõi điểm thành phần theo môn (HK1)."
        right={<Badge tone="sky"><TrendingUp className="mr-1 inline h-4 w-4" /> TB: {data?.overallAverage ?? '—'}</Badge>}
      />

      {loading || !data ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải...</div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          {data.subjects.map((s) => (
            <SectionCard
              key={s.subjectId}
              title={`${s.icon} ${s.subjectName}`}
              right={<Badge tone={s.average >= 8 ? 'emerald' : s.average >= 6.5 ? 'amber' : 'rose'}>TB: {s.average ?? '—'}</Badge>}
              subtitle={s.average < 6.5 ? 'Gợi ý: cần phụ đạo thêm môn này.' : 'Đang tiến bộ tốt!'}
            >
              <div className="grid grid-cols-2 gap-2">
                {s.components.map((c) => (
                  <div key={c.key} className="rounded-2xl bg-slate-50 p-3">
                    <div className="text-xs font-semibold text-slate-600">{c.label}</div>
                    <div className="mt-1 text-sm font-extrabold text-slate-900">{c.score ?? '—'}</div>
                  </div>
                ))}
              </div>
            </SectionCard>
          ))}
        </div>
      )}
    </div>
  )
}
