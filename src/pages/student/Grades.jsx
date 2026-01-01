import React, { useEffect, useState } from 'react'
import { BarChart3 } from 'lucide-react'

import PageHeader from '../../components/common/PageHeader'
import Badge from '../../components/common/Badge'
import SectionCard from '../../components/common/SectionCard'

import { useAuth } from '../../context/AuthContext'
import { gradeService } from '../../services/mock/gradeService'

export default function Grades() {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState(null)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const d = await gradeService.getStudentGrades(user.id, 'HK1')
      if (!mounted) return
      setData(d)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [user.id])

  return (
    <div className="p-4 md:p-6 pb-24 md:pb-6 space-y-4">
      <PageHeader
        title="Bảng điểm"
        subtitle="Điểm thành phần theo môn (THCS · HK1)."
        right={<Badge tone="amber"><BarChart3 className="mr-1 inline h-4 w-4" /> HK1</Badge>}
      />

      {loading || !data ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải...</div>
      ) : (
        <>
          <SectionCard
            title="Tổng kết"
            subtitle="Điểm trung bình chung (mock)"
            right={<Badge tone="emerald">TB: {data.overallAverage ?? '—'}</Badge>}
          >
            <div className="text-sm text-slate-700">Mẹo: xem từng môn để biết phần nào cần cải thiện.</div>
          </SectionCard>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
            {data.subjects.map((s) => (
              <SectionCard
                key={s.subjectId}
                title={`${s.icon} ${s.subjectName}`}
                right={<Badge tone={s.average >= 8 ? 'emerald' : s.average >= 6.5 ? 'amber' : 'rose'}>TB: {s.average ?? '—'}</Badge>}
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
        </>
      )}
    </div>
  )
}
