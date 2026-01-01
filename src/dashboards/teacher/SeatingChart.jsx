import React, { useMemo, useState } from 'react'
import { PhoneCall, UserCircle2 } from 'lucide-react'

import { useApp } from '../../context/AppProvider'
import { POINT_CATEGORIES } from '../../context/mockData'
import { Card } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Modal } from '../../components/ui/Modal'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'

function StudentChip({ student, draggable, onDragStart, onClick }) {
  return (
    <button
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={onClick}
      className="group flex w-full flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 text-left shadow-sm transition hover:-translate-y-[1px] hover:shadow-card focus:outline-none focus:ring-4 focus:ring-sky-100"
      title={student.fullName}
    >
      <div
        className={
          'flex h-11 w-11 items-center justify-center rounded-2xl text-xl ring-2 ' +
          student.avatar.color +
          ' ' +
          student.avatar.ring
        }
      >
        {student.avatar.emoji}
      </div>
      <div className="w-full">
        <div className="truncate text-sm font-semibold">{student.nickname}</div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <span className="text-xs text-slate-600">{student.points.balance} điểm</span>
          <span
            className={
              'text-[10px] font-semibold ' +
              (student.attendance.lastStatus === 'absent'
                ? 'text-rose-600'
                : 'text-emerald-700')
            }
          >
            {student.attendance.lastStatus === 'absent' ? 'Vắng' : 'Có mặt'}
          </span>
        </div>
      </div>
      <div className="pointer-events-none h-0 overflow-hidden opacity-0 transition group-hover:h-auto group-hover:opacity-100">
        <div className="mt-2 text-center text-[11px] text-slate-500">Kéo để đổi chỗ</div>
      </div>
    </button>
  )
}

function StudentProfile({ student }) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div
          className={
            'flex h-14 w-14 items-center justify-center rounded-2xl text-2xl ring-2 ' +
            student.avatar.color +
            ' ' +
            student.avatar.ring
          }
        >
          {student.avatar.emoji}
        </div>
        <div className="flex-1">
          <div className="text-base font-semibold">{student.fullName}</div>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge color="emerald">{student.points.balance} điểm</Badge>
            <Badge color="slate">Điểm danh: {student.attendance.presentDays} có mặt</Badge>
            <Badge color="rose">{student.attendance.absentDays} vắng</Badge>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-700">Liên hệ phụ huynh</div>
          <div className="mt-2 space-y-1 text-sm">
            <div className="font-semibold">{student.parent.name}</div>
            <div className="flex items-center gap-2 text-slate-600">
              <PhoneCall className="h-4 w-4" /> {student.parent.phone}
            </div>
            <div className="text-slate-600">Zalo: {student.parent.zalo}</div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
          <div className="text-xs font-semibold text-slate-700">Ghi chú sức khỏe</div>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
            {student.healthNotes.map((n, idx) => (
              <li key={idx}>{n}</li>
            ))}
          </ul>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-100 p-4">
        <div className="text-xs font-semibold text-slate-700">Lịch sử học tập (mock)</div>
        <div className="mt-3 space-y-2">
          {student.history.map((h, idx) => (
            <div key={idx} className="rounded-xl bg-slate-50 p-3">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold">
                  {h.subject} · {h.term}
                </div>
                <Badge color="amber">{h.grade}</Badge>
              </div>
              <div className="mt-1 text-sm text-slate-600">{h.note}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SeatingChart() {
  const { state, actions, selectors } = useApp()
  const [selectedId, setSelectedId] = useState(null)
  const [tab, setTab] = useState('actions')
  const [profileOpen, setProfileOpen] = useState(false)

  const selectedStudent = selectedId ? selectors.studentById[selectedId] : null

  const gridCells = useMemo(() => {
    const cells = []
    for (let y = 0; y < state.seating.rows; y++) {
      for (let x = 0; x < state.seating.columns; x++) cells.push({ x, y })
    }
    return cells
  }, [state.seating.rows, state.seating.columns])

  const studentAt = useMemo(() => {
    const map = {}
    for (const s of state.students) {
      const pos = state.seating.positions[s.id]
      if (!pos) continue
      map[`${pos.x}_${pos.y}`] = s.id
    }
    return map
  }, [state.students, state.seating.positions])

  function onDropCell(e, x, y) {
    const studentId = e.dataTransfer.getData('text/studentId')
    if (!studentId) return
    actions.moveSeat({ studentId, x, y })
  }

  return (
    <Card
      title="Sơ đồ lớp (Class Map)"
      right={<Badge color="emerald">Kéo thả · Click để thao tác</Badge>}
    >
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {gridCells.map((cell) => {
          const key = `${cell.x}_${cell.y}`
          const sid = studentAt[key]
          const student = sid ? selectors.studentById[sid] : null

          return (
            <div
              key={key}
              className={
                'relative rounded-2xl border border-dashed p-2 ' +
                (student ? 'border-slate-200 bg-slate-50' : 'border-slate-200/70 bg-white')
              }
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => onDropCell(e, cell.x, cell.y)}
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="text-[11px] font-semibold text-slate-600">
                  Bàn {cell.y + 1}-{cell.x + 1}
                </div>
                {student ? null : <div className="text-[11px] text-slate-400">Trống</div>}
              </div>

              {student ? (
                <StudentChip
                  student={student}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('text/studentId', student.id)}
                  onClick={() => {
                    setSelectedId(student.id)
                    setTab('actions')
                  }}
                />
              ) : (
                <div className="flex h-[110px] items-center justify-center rounded-2xl bg-white text-xs text-slate-400">
                  Thả học sinh vào đây
                </div>
              )}
            </div>
          )
        })}
      </div>

      <Modal
        open={!!selectedStudent}
        onClose={() => {
          setSelectedId(null)
          setProfileOpen(false)
        }}
        title={selectedStudent ? `Thao tác nhanh · ${selectedStudent.fullName}` : ''}
        footer={
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-600">
              Mẹo: thao tác ở đây sẽ đồng bộ ngay sang View Học sinh/Phụ huynh.
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => setProfileOpen(true)}>
                <UserCircle2 className="h-4 w-4" /> Profile
              </Button>
              <Button variant="ghost" onClick={() => setSelectedId(null)}>
                Đóng
              </Button>
            </div>
          </div>
        }
      >
        {selectedStudent ? (
          <>
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div
                  className={
                    'flex h-12 w-12 items-center justify-center rounded-2xl text-xl ring-2 ' +
                    selectedStudent.avatar.color +
                    ' ' +
                    selectedStudent.avatar.ring
                  }
                >
                  {selectedStudent.avatar.emoji}
                </div>
                <div>
                  <div className="text-sm font-semibold">{selectedStudent.nickname}</div>
                  <div className="text-xs text-slate-600">
                    Ví: <span className="font-semibold">{selectedStudent.points.balance}</span> điểm
                  </div>
                </div>
              </div>
              <Badge color={selectedStudent.attendance.lastStatus === 'absent' ? 'rose' : 'emerald'}>
                {selectedStudent.attendance.lastStatus === 'absent' ? 'Vắng' : 'Có mặt'}
              </Badge>
            </div>

            <div className="mt-4">
              <Tabs
                value={tab}
                onChange={setTab}
                items={[
                  { value: 'actions', label: 'Điểm & Điểm danh' },
                  { value: 'details', label: 'Chi tiết điểm' },
                ]}
              />
            </div>

            {tab === 'actions' ? (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="text-xs font-semibold text-slate-700">Cộng điểm nhanh</div>
                  <div className="mt-3 grid grid-cols-1 gap-2">
                    {POINT_CATEGORIES.map((c) => (
                      <Button
                        key={c.key}
                        variant="success"
                        className="justify-between"
                        onClick={() =>
                          actions.addPoints({
                            studentId: selectedStudent.id,
                            delta: 1,
                            category: c.key,
                            reason: `${c.label} (+1)`,
                          })
                        }
                      >
                        <span>+1 {c.label}</span>
                        <span className="text-xs opacity-90">Ctrl</span>
                      </Button>
                    ))}
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() =>
                        actions.addPoints({
                          studentId: selectedStudent.id,
                          delta: 10,
                          category: 'chamChi',
                          reason: 'Nỗ lực nổi bật (+10)',
                        })
                      }
                    >
                      +10 nổi bật
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        actions.addPoints({
                          studentId: selectedStudent.id,
                          delta: -2,
                          category: 'kyLuat',
                          reason: 'Nhắc nhở kỷ luật (-2)',
                        })
                      }
                    >
                      -2 nhắc nhở
                    </Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-100 p-4">
                  <div className="text-xs font-semibold text-slate-700">Điểm danh</div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <Button
                      variant="success"
                      onClick={() =>
                        actions.setAttendanceStatus({ studentId: selectedStudent.id, status: 'present' })
                      }
                    >
                      Có mặt
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() =>
                        actions.setAttendanceStatus({ studentId: selectedStudent.id, status: 'absent' })
                      }
                    >
                      Vắng
                    </Button>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 p-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600">Có mặt</span>
                      <span className="font-semibold">{selectedStudent.attendance.presentDays}</span>
                    </div>
                    <div className="mt-1 flex items-center justify-between">
                      <span className="text-slate-600">Vắng</span>
                      <span className="font-semibold">{selectedStudent.attendance.absentDays}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
                {POINT_CATEGORIES.map((c) => (
                  <div key={c.key} className="rounded-2xl border border-slate-100 p-4">
                    <div className="text-xs font-semibold text-slate-700">{c.label}</div>
                    <div className="mt-2 text-2xl font-extrabold">{selectedStudent.points?.[c.key] || 0}</div>
                    <div className="mt-1 text-xs text-slate-500">Điểm theo hạng mục</div>
                  </div>
                ))}
              </div>
            )}

            <Modal
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
              title={`Hồ sơ · ${selectedStudent.fullName}`}
              footer={<Button onClick={() => setProfileOpen(false)}>Đóng</Button>}
            >
              <StudentProfile student={selectedStudent} />
            </Modal>
          </>
        ) : null}
      </Modal>
    </Card>
  )
}
