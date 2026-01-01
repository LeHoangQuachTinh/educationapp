import React, { useEffect, useMemo, useState } from 'react'
import PageHeader from '../../components/common/PageHeader'
import { teacherService } from '../../services/mock/teacherService'
import { useTeacherClass } from '../../context/TeacherClassContext'
import StudentInfoModal from '../../components/teacher/StudentInfoModal'

export default function ClassSeatingGrid() {
  const { currentClassId, currentClass } = useTeacherClass()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [open, setOpen] = useState(false)

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

  const grid = useMemo(() => {
    const cols = 5
    const rows = 4
    const map = {}
    for (const s of students) map[`${s.position.x}_${s.position.y}`] = s
    return { cols, rows, map }
  }, [students])

  return (
    <div className="space-y-4">
      <PageHeader
        title={`Sơ đồ chỗ ngồi (Grid) · ${currentClass?.name || `Lớp ${currentClassId}`}`}
        subtitle="Click đúng từng chỗ (x,y) để xem thông tin học sinh."
      />

      {loading ? (
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-card">Đang tải...</div>
      ) : (
        <div className="rounded-3xl border border-slate-100 bg-white p-4 shadow-card">
          <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${grid.cols}, minmax(0, 1fr))` }}>
            {Array.from({ length: grid.cols * grid.rows }).map((_, idx) => {
              const x = idx % grid.cols
              const y = Math.floor(idx / grid.cols)
              const s = grid.map[`${x}_${y}`]

              return (
                <button
                  key={`${x}_${y}`}
                  onClick={() => {
                    if (!s) return
                    setSelected(s)
                    setOpen(true)
                  }}
                  className={
                    'rounded-3xl border p-4 text-left transition ' +
                    (s
                      ? 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                      : 'border-dashed border-slate-200 bg-white text-slate-400')
                  }
                >
                  <div className="text-[11px] font-semibold text-slate-500">Bàn {y + 1}-{x + 1}</div>
                  {s ? (
                    <div className="mt-2 flex items-center gap-3">
                      <div className="text-2xl">{s.avatar}</div>
                      <div className="min-w-0">
                        <div className="truncate text-sm font-extrabold text-slate-900">{s.name}</div>
                        <div className="mt-1 text-xs text-slate-600">{s.currentPoints} điểm</div>
                      </div>
                    </div>
                  ) : (
                    <div className="mt-2 text-xs">(Trống)</div>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      )}

      <StudentInfoModal open={open} student={selected} onClose={() => setOpen(false)} />
    </div>
  )
}
