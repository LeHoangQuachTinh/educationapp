import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, ShieldCheck } from 'lucide-react'

import { teacherService } from '../../services/mock/teacherService'
import { useTeacherClass } from '../../context/TeacherClassContext'
import QuickActionModal from '../../components/teacher/QuickActionModal'
import StudentInfoModal from '../../components/teacher/StudentInfoModal'

function StatusBadge({ status }) {
  const map = {
    Present: 'bg-emerald-100 text-emerald-800',
    Absent: 'bg-rose-100 text-rose-800',
    Late: 'bg-amber-100 text-amber-800',
  }
  const label = status === 'Present' ? 'Có mặt' : status === 'Absent' ? 'Vắng' : 'Trễ'
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  )
}

function StudentCard({ student, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-3xl border border-slate-100 bg-white p-4 text-left shadow-card transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-50 text-3xl">
            {student.avatar}
          </div>
          <div>
            <div className="text-sm font-extrabold text-slate-900">{student.name}</div>
            <div className="mt-1 text-xs text-slate-600">Bàn {student.position.y + 1}-{student.position.x + 1}</div>
          </div>
        </div>

        <div className="text-right">
          <div className="inline-flex items-center rounded-2xl bg-sky-600 px-3 py-2 text-sm font-extrabold text-white">
            {student.currentPoints}
          </div>
          <div className="mt-2">
            <StatusBadge status={student.status} />
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-slate-500 group-hover:text-slate-600">
        Click để thao tác nhanh
      </div>
    </button>
  )
}

export default function ClassMap() {
  const { currentClassId, currentClass } = useTeacherClass()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [infoOpen, setInfoOpen] = useState(false)

  useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      const data = await teacherService.getClassList(currentClassId)
      if (!mounted) return
      setStudents(data)
      setLoading(false)
    }
    load()
    return () => {
      mounted = false
    }
  }, [currentClassId])

  const sorted = useMemo(() => {
    // Sort by seating position for nicer grid stability
    return [...students].sort((a, b) => (a.position.y - b.position.y) || (a.position.x - b.position.x))
  }, [students])

  function optimisticUpdate({ studentId, patch }) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...patch } : s)))
  }

  if (loading) {
    return (
      <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
        <div className="text-sm font-semibold">Đang tải Sơ đồ lớp...</div>
        <div className="mt-2 text-sm text-slate-600">Mock API latency 500ms</div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-5 w-5 text-sky-600" />
              <div className="text-lg font-extrabold">Sơ đồ lớp (Class Map) · {currentClass?.name || `Lớp ${currentClassId}`}</div>
            </div>
            <div className="mt-1 text-sm text-slate-600">
              Click học sinh để cộng điểm / điểm danh (Quick Action Modal).
            </div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            Protected: Teacher only
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {sorted.map((s) => (
          <StudentCard
            key={s.id}
            student={s}
            onClick={() => {
              setSelected(s)
              setInfoOpen(true)
            }}
          />
        ))}
      </div>

      <StudentInfoModal
        open={infoOpen}
        student={selected}
        onClose={() => setInfoOpen(false)}
      />

      <QuickActionModal
        open={!!selected && !infoOpen}
        student={selected}
        onClose={() => setSelected(null)}
        onOptimisticUpdate={optimisticUpdate}
      />
    </div>
  )
}
