import React, { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, Grid3x3, ShieldCheck } from 'lucide-react'

import { teacherService } from '../../services/mock/teacherService'
import { useTeacherClass } from '../../context/TeacherClassContext'
import QuickActionModal from '../../components/teacher/QuickActionModal'
import StudentInfoModal from '../../components/teacher/StudentInfoModal'
import Tabs from '../../components/common/Tabs'

function StatusBadge({ status }) {
  const map = {
    Present: 'bg-emerald-100 text-emerald-800',
    Absent: 'bg-rose-100 text-rose-800',
    Late: 'bg-amber-100 text-amber-800',
  }
  const label = status === 'Present' ? 'Có mặt' : status === 'Absent' ? 'Vắng' : 'Trễ'
  return (
    <span className={`inline-flex items-center justify-center rounded-xl px-2 py-0.5 text-[10px] font-semibold md:text-xs ${map[status] || 'bg-slate-100 text-slate-700'}`}>
      {label}
    </span>
  )
}

function StudentCard({ student, onClick }) {
  return (
    <button
      onClick={onClick}
      className="group w-full rounded-3xl border border-slate-100 bg-white p-3 text-left shadow-card transition hover:-translate-y-[1px] hover:shadow-lg focus:outline-none focus:ring-4 focus:ring-sky-100 md:p-4"
    >
      <div className="flex items-center gap-2 md:gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-3xl bg-slate-50 text-2xl md:h-12 md:w-12 md:text-3xl">
          {student.avatar}
        </div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xs font-extrabold text-slate-900 md:text-sm">{student.name}</div>
          <div className="mt-1 text-[10px] text-slate-600 md:text-xs">Bàn {student.position.y + 1}-{student.position.x + 1}</div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2">
        <div className="inline-flex items-center justify-center rounded-xl bg-sky-600 px-2 py-1 text-[10px] font-extrabold text-white md:text-xs">
          💰 {student.currentPoints}
        </div>
        <StatusBadge status={student.status} />
      </div>

      <div className="mt-2 text-[10px] text-slate-500 group-hover:text-slate-600 md:text-xs">
        Click để thao tác nhanh
      </div>
    </button>
  )
}

function GridView({ students, onSelectStudent }) {
  const grid = useMemo(() => {
    const cols = 5
    const rows = 4
    const map = {}
    for (const s of students) map[`${s.position.x}_${s.position.y}`] = s
    return { cols, rows, map }
  }, [students])

  return (
    <div className="space-y-3">
      <div className="text-xs text-slate-600 md:text-sm">
        Click vào từng chỗ ngồi để xem thông tin học sinh
      </div>
      <div 
        className="grid gap-1.5 md:gap-2" 
        style={{ 
          gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` 
        }}
      >
        {Array.from({ length: grid.cols * grid.rows }).map((_, idx) => {
          const x = idx % grid.cols
          const y = Math.floor(idx / grid.cols)
          const s = grid.map[`${x}_${y}`]

          return (
            <button
              key={`${x}_${y}`}
              onClick={() => {
                if (!s) return
                onSelectStudent(s)
              }}
              className={
                'flex flex-col aspect-square rounded-xl border p-1.5 transition md:rounded-2xl md:p-2 ' +
                (s
                  ? 'border-slate-200 bg-slate-50 hover:bg-sky-50 hover:border-sky-300 hover:shadow-sm cursor-pointer'
                  : 'border-dashed border-slate-200 bg-white text-slate-400')
              }
            >
              <div className="text-[9px] font-semibold text-slate-500 md:text-[10px]">
                {y + 1}-{x + 1}
              </div>
              {s ? (
                <div className="mt-1 flex flex-col items-center justify-center text-center md:mt-2">
                  <div className="text-xl md:text-2xl">{s.avatar}</div>
                  <div className="mt-1 min-w-0 w-full">
                    <div className="truncate text-[9px] font-extrabold text-slate-900 md:text-[10px]">
                      {s.name}
                    </div>
                    <div className="mt-0.5 text-[8px] text-slate-600 md:text-[9px]">
                      {s.currentPoints}đ
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-[9px] text-slate-400 md:text-[10px]">Trống</div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default function ClassSeating() {
  const { currentClassId, currentClass } = useTeacherClass()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [infoOpen, setInfoOpen] = useState(false)
  const [activeView, setActiveView] = useState('list') // 'list' or 'grid'

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
    return [...students].sort((a, b) => (a.position.y - b.position.y) || (a.position.x - b.position.x))
  }, [students])

  function optimisticUpdate({ studentId, patch }) {
    setStudents((prev) => prev.map((s) => (s.id === studentId ? { ...s, ...patch } : s)))
  }

  function handleSelectStudent(student) {
    setSelected(student)
    setInfoOpen(true)
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">
          <div className="text-sm font-semibold">Đang tải sơ đồ lớp...</div>
          <div className="mt-2 text-sm text-slate-600">Vui lòng chờ</div>
        </div>
      </div>
    )
  }

  const tabs = [
    { value: 'list', label: 'Danh sách' },
    { value: 'grid', label: 'Sơ đồ chỗ ngồi' },
  ]

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card md:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-sky-600 md:h-5 md:w-5" />
              <div className="text-base font-extrabold md:text-lg">
                Sơ đồ lớp · {currentClass?.name || `Lớp ${currentClassId}`}
              </div>
            </div>
            <div className="mt-1 text-xs text-slate-600 md:text-sm">
              {activeView === 'list' 
                ? 'Click học sinh để cộng điểm / điểm danh nhanh'
                : 'Xem sơ đồ chỗ ngồi theo bàn'}
            </div>
          </div>
          <div className="inline-flex items-center gap-2 self-start rounded-2xl bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600">
            <ShieldCheck className="h-3.5 w-4 text-emerald-600 md:h-4 md:w-4" />
            <span className="hidden sm:inline">Teacher only</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="rounded-3xl border border-slate-100 bg-white shadow-card">
        <div className="border-b border-slate-100 px-4 py-3 md:px-6 md:py-4">
          <Tabs value={activeView} onChange={setActiveView} items={tabs} />
        </div>

        <div className="p-3 md:p-6">
          {activeView === 'list' ? (
            <div>
              {sorted.length === 0 ? (
                <div className="py-12 text-center text-sm text-slate-600">
                  Chưa có học sinh trong lớp
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-3 xl:grid-cols-4">
                  {sorted.map((s) => (
                    <StudentCard
                      key={s.id}
                      student={s}
                      onClick={() => handleSelectStudent(s)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <GridView students={students} onSelectStudent={handleSelectStudent} />
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-card md:p-4">
          <div className="text-[10px] font-semibold text-slate-600 md:text-xs">Tổng sĩ số</div>
          <div className="mt-2 text-2xl font-extrabold text-slate-900 md:text-3xl">{students.length}</div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-card md:p-4">
          <div className="text-[10px] font-semibold text-slate-600 md:text-xs">Có mặt</div>
          <div className="mt-2 text-2xl font-extrabold text-emerald-600 md:text-3xl">
            {students.filter((s) => s.status === 'Present').length}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-card md:p-4">
          <div className="text-[10px] font-semibold text-slate-600 md:text-xs">Vắng</div>
          <div className="mt-2 text-2xl font-extrabold text-rose-600 md:text-3xl">
            {students.filter((s) => s.status === 'Absent').length}
          </div>
        </div>
        <div className="rounded-3xl border border-slate-100 bg-white p-3 shadow-card md:p-4">
          <div className="text-[10px] font-semibold text-slate-600 md:text-xs">Trễ</div>
          <div className="mt-2 text-2xl font-extrabold text-amber-600 md:text-3xl">
            {students.filter((s) => s.status === 'Late').length}
          </div>
        </div>
      </div>

      {/* Modals */}
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
